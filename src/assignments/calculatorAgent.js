import { input } from "@inquirer/prompts";
import { OPENAI_MODEL } from "../shared/config.js";
import { createOpenAIClient, describeOpenAIError } from "../shared/openaiClient.js";
import { createToolRegistry, runToolChat } from "../shared/toolRunner.js";
import { calculatorTool } from "../tools/calculatorTool.js";

const client = createOpenAIClient();
const registry = createToolRegistry([calculatorTool]);
const messages = [
  {
    role: "developer",
    content:
      "你是細心的數學助理。使用者提出算式或數字問題時，請優先呼叫 calculate 工具，再用繁體中文解釋結果。"
  }
];

console.log("計算機工具助理啟動。輸入 exit 結束。");

while (true) {
  const question = (await input({ message: "請輸入想計算的問題：" })).trim();
  if (question.toLowerCase() === "exit") break;

  messages.push({ role: "user", content: question });
  let answer;
  try {
    answer = await runToolChat({ client, model: OPENAI_MODEL, messages, registry });
  } catch (error) {
    console.log(`\n連線失敗：${describeOpenAIError(error)}\n`);
    continue;
  }
  console.log(`\n助理：${answer}\n`);
}
