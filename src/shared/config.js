import "dotenv/config";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY ?? "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
