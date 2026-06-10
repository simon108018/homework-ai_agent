import { EMBEDDING_MODEL } from "./config.js";
import { withOpenAIRetry } from "./openaiClient.js";

export async function embedTexts(client, texts, model = EMBEDDING_MODEL) {
  const normalized = Array.isArray(texts) ? texts : [texts];
  const response = await withOpenAIRetry(() =>
    client.embeddings.create({
      model,
      input: normalized
    })
  );

  return response.data.map((item) => item.embedding);
}

export async function embedText(client, text, model = EMBEDDING_MODEL) {
  const [embedding] = await embedTexts(client, [text], model);
  return embedding;
}
