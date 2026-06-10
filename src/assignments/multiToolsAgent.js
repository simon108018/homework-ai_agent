import { input } from "@inquirer/prompts";
import { OPENAI_MODEL } from "../shared/config.js";
import { createOpenAIClient, describeOpenAIError } from "../shared/openaiClient.js";
import { createToolRegistry, runToolChat } from "../shared/toolRunner.js";
import { currentTimeTool, weatherTool } from "../tools/index.js";

const client = createOpenAIClient();
const registry = createToolRegistry([currentTimeTool, weatherTool]);
const messages = [
  {
    role: "developer",
    content:
      "你是生活資訊助理。使用者問時間就呼叫 get_current_time，問天氣就呼叫 get_weather；如果同一句同時問時間和天氣，兩個工具都要使用。請用繁體中文回答。"
  }
];

console.log("時間與天氣雙工具助理啟動。可試：現在幾點？台北天氣如何？現在幾點？台北天氣好嗎？");
console.log("輸入 exit 結束。");

while (true) {
  const question = (await input({ message: "請輸入你的問題：" })).trim();
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
