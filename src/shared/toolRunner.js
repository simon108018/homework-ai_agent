import { withOpenAIRetry } from "./openaiClient.js";

export function createToolRegistry(tools) {
  const toolMap = new Map();

  for (const tool of tools) {
    if (toolMap.has(tool.name)) {
      throw new Error(`工具名稱重複：${tool.name}`);
    }
    toolMap.set(tool.name, tool);
  }

  return {
    list() {
      return [...toolMap.values()];
    },

    toOpenAITools() {
      return [...toolMap.values()].map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
    },

    async dispatch(name, args) {
      const tool = toolMap.get(name);
      if (!tool) {
        throw new Error(`沒有註冊名為 ${name} 的工具。`);
      }
      return await tool.handler(args);
    }
  };
}

export async function runToolCalls(message, registry, { logger } = {}) {
  const calls = message.tool_calls ?? [];

  return await Promise.all(
    calls.map(async (toolCall) => {
      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        logger?.(`[工具呼叫] ${toolCall.function.name} ${JSON.stringify(args)}`);
        const result = await registry.dispatch(toolCall.function.name, args);
        logger?.(`[工具結果] ${JSON.stringify(result)}`);
        return {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        };
      } catch (error) {
        return {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: error.message })
        };
      }
    })
  );
}

export async function runToolChat({ client, model, messages, registry, maxRounds = 6 }) {
  const tools = registry.toOpenAITools();

  for (let round = 0; round < maxRounds; round += 1) {
    const response = await withOpenAIRetry(() =>
      client.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: "auto"
      })
    );
    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls?.length) {
      return message.content ?? "";
    }

    const toolResults = await runToolCalls(message, registry, { logger: console.log });
    messages.push(...toolResults);
  }

  throw new Error("工具呼叫超過安全回合上限，請簡化問題後再試一次。");
}
