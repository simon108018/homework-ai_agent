import { createOpenAIClient } from "../shared/openaiClient.js";
import { describeOpenAIError } from "../shared/openaiClient.js";
import { embedTexts } from "../shared/embedding.js";
import { cosineSimilarity } from "../shared/vectorMath.js";
import { printSection } from "../shared/formatting.js";

const groups = [
  {
    title: "意思接近：早餐情境",
    sentences: ["我早上買了一杯咖啡", "今天早餐喝了拿鐵", "上班前我去咖啡店外帶飲料"]
  },
  {
    title: "意思分散：日常雜訊",
    sentences: ["窗外正在下雨", "我需要更新電腦系統", "週末想整理房間"]
  },
  {
    title: "自訂案例：學習程式",
    sentences: ["我正在練習 JavaScript 函式", "今天學會用 Node.js 寫 CLI", "Rust 的所有權規則需要時間理解"]
  }
];

const client = createOpenAIClient();

for (const group of groups) {
  printSection(group.title);
  let embeddings;
  try {
    embeddings = await embedTexts(client, group.sentences);
  } catch (error) {
    console.log(`Embeddings 呼叫失敗：${describeOpenAIError(error)}`);
    process.exitCode = 1;
    break;
  }

  for (let left = 0; left < group.sentences.length; left += 1) {
    for (let right = left + 1; right < group.sentences.length; right += 1) {
      const score = cosineSimilarity(embeddings[left], embeddings[right]);
      console.log(`「${group.sentences[left]}」 vs 「${group.sentences[right]}」 => ${score.toFixed(3)}`);
    }
  }
}

console.log("\n觀察：同一情境或同一主題的句子通常分數較高；主題分散時，分數通常會下降。");
