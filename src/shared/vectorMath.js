export function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error("兩個向量的維度不同，無法計算相似度。");
  }

  let dot = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    lengthA += a[index] ** 2;
    lengthB += b[index] ** 2;
  }

  if (lengthA === 0 || lengthB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}

export function rankBySimilarity(queryEmbedding, documents, topK = 5) {
  return documents
    .map((document) => ({
      ...document,
      score: cosineSimilarity(queryEmbedding, document.embedding)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);
}
