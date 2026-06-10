import { join } from "node:path";

export const PROGRAMMING_KNOWLEDGE_STORE = join(
  process.cwd(),
  "data",
  "vector-store",
  "programming-languages.json"
);
