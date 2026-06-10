import { input } from "@inquirer/prompts";
import { OPENAI_MODEL } from "../shared/config.js";
import { createOpenAIClient, describeOpenAIError, withOpenAIRetry } from "../shared/openaiClient.js";

const systemPrompt = `你是「多益生活英文單字教練」，專門用繁體中文陪學生練英文單字。
回答請簡短、清楚，像平常複習英文一樣。每次回答都要包含：單字意思、生活例句、常見搭配詞，
並且在學生問過三個單字後，主動挑一個前面學過的單字做小複習，讓對話看得出你記得前文。`;

const client = createOpenAIClient();
const messages = [{ role: "developer", content: systemPrompt }];

console.log("多益生活英文單字教練啟動。輸入 exit 結束。");

while (true) {
  const question = (await input({ message: "想練哪個單字或句子？" })).trim();
  if (question.toLowerCase() === "exit") break;

  messages.push({ role: "user", content: question });
  let response;
  try {
    response = await withOpenAIRetry(() =>
      client.chat.completions.create({
        model: OPENAI_MODEL,
        messages
      })
    );
  } catch (error) {
    console.log(`\n連線失敗：${describeOpenAIError(error)}\n`);
    continue;
  }

  const answer = response.choices[0].message.content ?? "";
  messages.push({ role: "assistant", content: answer });
  console.log(`\n教練：${answer}\n`);
}
