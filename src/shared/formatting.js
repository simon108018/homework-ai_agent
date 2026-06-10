export function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

export function printSearchResults(results) {
  if (results.length === 0) {
    console.log("目前沒有搜尋結果，請先執行 npm run start:rag:init 建立知識庫。");
    return;
  }

  for (const [index, result] of results.entries()) {
    console.log(`${index + 1}. ${result.title}｜相似度 ${result.score.toFixed(3)}`);
    console.log(`   ${result.content}`);
  }
}
