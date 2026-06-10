import { OPENWEATHER_API_KEY } from "../shared/config.js";

export const weatherTool = {
  name: "get_weather",
  description: "查詢指定城市目前的天氣、攝氏溫度與濕度。",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "城市名稱，建議使用英文城市名，例如 Taipei、Tokyo、London。"
      }
    },
    required: ["city"],
    additionalProperties: false
  },
  handler: getWeather
};

export async function getWeather(
  { city },
  { fetchImpl = fetch, apiKey = OPENWEATHER_API_KEY } = {}
) {
  if (!apiKey) {
    return { error: "缺少 OPENWEATHER_API_KEY，請先在 .env 設定天氣 API key。" };
  }

  if (!city || typeof city !== "string") {
    return { error: "請提供 city 字串，例如 Taipei。" };
  }

  const geoUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
  geoUrl.searchParams.set("q", city);
  geoUrl.searchParams.set("limit", "1");
  geoUrl.searchParams.set("appid", apiKey);

  const geoResponse = await fetchImpl(geoUrl);
  if (!geoResponse.ok) {
    return { error: `OpenWeather 地理查詢失敗：HTTP ${geoResponse.status}` };
  }

  const [place] = await geoResponse.json();
  if (!place) {
    return { error: `找不到城市：${city}` };
  }

  const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  weatherUrl.searchParams.set("lat", String(place.lat));
  weatherUrl.searchParams.set("lon", String(place.lon));
  weatherUrl.searchParams.set("appid", apiKey);
  weatherUrl.searchParams.set("units", "metric");
  weatherUrl.searchParams.set("lang", "zh_tw");

  const weatherResponse = await fetchImpl(weatherUrl);
  if (!weatherResponse.ok) {
    return { error: `OpenWeather 天氣查詢失敗：HTTP ${weatherResponse.status}` };
  }

  const data = await weatherResponse.json();
  return {
    city: data.name ?? place.name,
    country: place.country,
    temperatureCelsius: data.main?.temp,
    humidity: data.main?.humidity,
    description: data.weather?.[0]?.description ?? "無天氣描述"
  };
}
