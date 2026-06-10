import OpenAI from "openai";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { OPENAI_API_KEY } from "./config.js";

export function createOpenAIClient(apiKey = OPENAI_API_KEY) {
  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY，請先建立 .env 並填入 OpenAI key。");
  }

  const proxyUrl = getProxyUrl();
  if (!proxyUrl) {
    return new OpenAI({ apiKey });
  }

  const dispatcher = new ProxyAgent(proxyUrl);

  return new OpenAI({
    apiKey,
    fetch: (url, init = {}) => undiciFetch(url, { ...init, dispatcher })
  });
}

export function getProxyUrl(env = process.env) {
  return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || "";
}

export async function withOpenAIRetry(operation, { retries = 2, delayMs = 800 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientOpenAIError(error) || attempt === retries) {
        throw error;
      }
      await wait(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}

export function describeOpenAIError(error) {
  const code = findErrorCode(error);

  if (code === "ECONNRESET") {
    return "OpenAI 連線被中斷，通常是網路、防火牆、VPN、代理伺服器或暫時性連線問題。請稍後重試，或換網路再跑一次。";
  }

  if (error?.status === 401) {
    return "OpenAI key 驗證失敗，請確認 .env 裡的 OPENAI_API_KEY 是否正確。";
  }

  if (error?.status === 429) {
    return "OpenAI 請求被限流或額度不足，請稍後再試或確認帳號額度。";
  }

  if (error?.name === "APIConnectionError") {
    return "OpenAI API 連線失敗，請確認目前網路可以正常連到 api.openai.com。";
  }

  return error?.message ?? String(error);
}

function isTransientOpenAIError(error) {
  return error?.name === "APIConnectionError" || ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(findErrorCode(error));
}

function findErrorCode(error) {
  let current = error;

  while (current) {
    if (current.code) return current.code;
    current = current.cause;
  }

  return undefined;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
