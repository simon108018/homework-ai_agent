export function getCurrentTime(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  return {
    timeZone: "Asia/Taipei",
    display: `${formatter.format(date)}（台灣時間）`
  };
}

export const currentTimeTool = {
  name: "get_current_time",
  description: "取得目前的台灣時間，適合回答現在幾點、今天日期等問題。",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  handler: async () => getCurrentTime()
};
