import { input } from "@inquirer/prompts";
import { createOpenAIClient, describeOpenAIError } from "../shared/openaiClient.js";
import { embedText } from "../shared/embedding.js";
import { printSearchResults } from "../shared/formatting.js";
import { PROGRAMMING_KNOWLEDGE_STORE } from "../shared/paths.js";
import { JsonVectorStore } from "../shared/vectorStore.js";

const exampleQueries = [
  "我想做網頁互動和小工具，哪個語言適合？",
  "哪個語言常被拿來做 AI 和資料分析？",
  "如果我重視效能和記憶體安全，可以看哪個語言？"
];

const client = createOpenAIClient();
const store = new JsonVectorStore(PROGRAMMING_KNOWLEDGE_STORE);

console.log("程式語言語意搜尋。輸入 demo 跑三個示範問題，輸入 exit 結束。");

while (true) {
  const query = (await input({ message: "請輸入你的搜尋問題：" })).trim();
  if (query.toLowerCase() === "exit") break;

  const queries = query.toLowerCase() === "demo" ? exampleQueries : [query];
  for (const currentQuery of queries) {
    console.log(`\n問題：${currentQuery}`);
    let embedding;
    try {
      embedding = await embedText(client, currentQuery);
    } catch (error) {
      console.log(`搜尋失敗：${describeOpenAIError(error)}`);
      continue;
    }
    const results = await store.search(embedding, 3);
    printSearchResults(results);
  }
}
