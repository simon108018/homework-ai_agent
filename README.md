# AI Agent 課後作業

這個專案用 Node.js CLI 完成課後作業的 5 個練習：角色聊天、Function Calling、RAG 搜尋、兩個工具同時使用，以及 Embeddings 相似度比較。

## 環境設定

需要 Node.js 22 以上版本。

```bash
npm install
```

新增 `.env`，可以參考 `.env.example`：

```bash
OPENAI_API_KEY=你的 OpenAI key
OPENWEATHER_API_KEY=你的 OpenWeather key
OPENAI_MODEL=gpt-5-mini
EMBEDDING_MODEL=text-embedding-3-small
```

`.env` 不會提交到 Git，API key 請只放在本機。

## 專案結構

```text
src/assignments/   每一題作業的執行入口
src/shared/        共用的 OpenAI、tool、向量計算與 JSON 儲存程式
src/tools/         calculate、時間、天氣工具
data/knowledge/    RAG 用的 5 筆程式語言資料
tests/             Vitest 測試
```

## 作業 1：英文單字教練

```bash
npm run start:role
```

角色設定是多益生活英文單字教練。使用者可以連續問英文單字，程式會把前面的對話一起帶給模型，所以後面可以請它回顧前面學過的字。

可測：

```text
productive
deadline
Can you review the words I asked?
```

## 作業 2：計算機工具

```bash
npm run start:calculator
```

這題註冊 `calculate` 工具。工具參數是 `expression`，例如 `10 + 5 * 2`。計算程式只支援數字、小數、括號、加減乘除與空白。

可測：

```text
請幫我算 (120 + 80) / 4
10 + 5 * 2 是多少？
```

## 作業 3：程式語言 RAG

先建立本機向量資料：

```bash
npm run start:rag:init
```

再進入搜尋：

```bash
npm run start:rag:search
```

輸入 `demo` 會跑三個測試問題。資料內容在 `data/knowledge/programming-languages.json`，包含 JavaScript、Python、Ruby、Go、Rust。

搜尋結果會像這樣：

```text
問題：哪個語言常被拿來做 AI 和資料分析？
1. Python｜相似度 0.812
   Python 語法接近自然語言，常用於資料分析、AI、爬蟲、自動化與教學。
```

## 作業 4：時間與天氣工具

```bash
npm run start:multi-tools
```

這題註冊兩個工具：

- `get_current_time`：回傳台灣時間。
- `get_weather`：用 OpenWeather 查城市天氣。

可測：

```text
現在幾點？
台北天氣如何？
現在幾點？台北天氣好嗎？
```

第三個問題會讓模型同時用時間和天氣兩個工具。

## 作業 5：相似度實驗

```bash
npm run start:similarity
```

程式會把三組句子轉成 embedding，再計算兩兩 cosine similarity。

三組句子：

- 早餐相關句子
- 彼此不太相關的日常句子
- 學程式相關句子

## 測試

```bash
npm test
```

測試包含計算機、tool registry、cosine similarity、JSON 向量搜尋、時間工具與天氣工具 mock。

## 執行結果紀錄

截圖放在 `screenshots/` 資料夾。以下是這次測試使用的問題和結果摘要。

### 作業 1：英文單字教練

執行指令：

```bash
npm run start:role
```

測試問題：

```text
我想學習生活相關的句子
那我如何取消預約
那如果我想改約時間呢?
可以幫我複習剛剛學到的單字嗎?
有沒有更深入的應用
```

結果紀錄：

```text
已測試。AI 先介紹 appointment，再依照後續問題補充 cancel、reschedule。
第 4 輪請它複習時，它有整理 appointment、cancel、reschedule 三個前面學過的單字。
第 5 輪詢問更深入應用時，它延伸到電話改約、取消預約、email 範本、取消政策和候補名單等情境。
這題可看出角色設定正常，也有把前面的對話內容帶入後續回答。
```

截圖：

```text
screenshots/assignment-1-vocab-coach.png
```

### 作業 2：計算機工具

執行指令：

```bash
npm run start:calculator
```

測試問題：

```text
100 mod 3 等於多少？
```

結果紀錄：

```text
已測試。AI 判斷問題需要計算後，有呼叫 calculate 工具。
畫面中顯示工具呼叫為 calculate，參數是 {"expression":"100 - 3*33"}。
工具結果回傳 {"expression":"100 - 3*33","result":1}，AI 最後回答 100 除以 3 的餘數是 1。
這題可看出模型不是直接猜答案，而是先產生工具呼叫，再用工具結果整理回答。
```

截圖：

```text
screenshots/assignment-2-calculator.png
```

### 作業 3：程式語言 RAG

執行指令：

```bash
npm run start:rag:init
npm run start:rag:search
```

測試問題：

```text
demo
```

demo 會測三個問題：

```text
我想做網頁互動和小工具，哪個語言適合？
哪個語言常被拿來做 AI 和資料分析？
如果我重視效能和記憶體安全，可以看哪個語言？
```

結果紀錄：

```text
已測試。初始化時顯示「已建立程式語言知識庫，共 5 筆」，
資料儲存在 data/vector-store/programming-languages.json。

搜尋 demo 跑了三個問題：
1.「我想做網頁互動和小工具，哪個語言適合？」
   第一名為 JavaScript，相似度 0.637。
2.「哪個語言常被拿來做 AI 和資料分析？」
   第一名為 Python，相似度 0.621。
3.「如果我重視效能和記憶體安全，可以看哪個語言？」
   第一名為 Rust，相似度 0.558。

結果符合預期：不同問法可以從 5 筆知識庫中找到相關的程式語言資料。
```

截圖：

```text
screenshots/assignment-3-rag-search.png
```

### 作業 4：時間與天氣工具

執行指令：

```bash
npm run start:multi-tools
```

測試問題：

```text
現在幾點？
台北天氣如何？
現在幾點？台北天氣好嗎？
```

結果紀錄：

```text
已測試。程式成功呼叫 Embeddings API，並計算三組句子的兩兩 cosine similarity。

第 1 組「早餐情境」：
- 咖啡 vs 拿鐵：0.593
- 咖啡 vs 咖啡店外帶飲料：0.702
- 拿鐵 vs 咖啡店外帶飲料：0.468

第 2 組「日常雜訊」：
- 下雨 vs 更新電腦系統：0.315
- 下雨 vs 整理房間：0.347
- 更新電腦系統 vs 整理房間：0.327

第 3 組「學習程式」：
- JavaScript 函式 vs Node.js CLI：0.528
- JavaScript 函式 vs Rust 所有權：0.307
- Node.js CLI vs Rust 所有權：0.263

觀察：同一生活情境或同一技術主題的分數較高；主題分散時分數較低，符合預期。
```

截圖：

```text
screenshots/assignment-4-time-weather.png
```

### 作業 5：相似度實驗

執行指令：

```bash
npm run start:similarity
```

結果紀錄：

```text
待補截圖後填入實際輸出。
```

截圖：

```text
screenshots/assignment-5-similarity.png
```
