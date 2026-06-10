import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { rankBySimilarity } from "./vectorMath.js";

export class JsonVectorStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async saveAll(documents) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const payload = {
      createdAt: new Date().toISOString(),
      documents
    };
    await writeFile(this.filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }

  async loadAll() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return parsed.documents ?? [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async search(queryEmbedding, topK = 5) {
    const documents = await this.loadAll();
    return rankBySimilarity(queryEmbedding, documents, topK);
  }
}
