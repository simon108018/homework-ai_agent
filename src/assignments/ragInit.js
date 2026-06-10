import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createOpenAIClient, describeOpenAIError } from "../shared/openaiClient.js";
import { embedTexts } from "../shared/embedding.js";
import { JsonVectorStore } from "../shared/vectorStore.js";
import { PROGRAMMING_KNOWLEDGE_STORE } from "../shared/paths.js";

const here = dirname(fileURLToPath(import.meta.url));
const knowledgePath = join(here, "..", "..", "data", "knowledge", "programming-languages.json");

const client = createOpenAIClient();
const sourceDocuments = JSON.parse(await readFile(knowledgePath, "utf8"));
let embeddings;

try {
  embeddings = await embedTexts(
    client,
    sourceDocuments.map((document) => `${document.title}\n${document.content}`)
  );
} catch (error) {
  console.log(`建立知識庫失敗：${describeOpenAIError(error)}`);
  process.exitCode = 1;
  process.exit(1);
}

const documents = sourceDocuments.map((document, index) => ({
  ...document,
  embedding: embeddings[index]
}));

const store = new JsonVectorStore(PROGRAMMING_KNOWLEDGE_STORE);
await store.saveAll(documents);

console.log(`已建立程式語言知識庫，共 ${documents.length} 筆。`);
console.log(`儲存位置：${PROGRAMMING_KNOWLEDGE_STORE}`);
