import { evaluateExpression } from "../shared/calculator.js";

export const calculatorTool = {
  name: "calculate",
  description: "進行安全的四則運算，支援數字、小數、括號、加減乘除。",
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "要計算的算式，例如 10 + 5 * 2。"
      }
    },
    required: ["expression"],
    additionalProperties: false
  },
  handler: async ({ expression }) => {
    try {
      return {
        expression,
        result: evaluateExpression(expression)
      };
    } catch (error) {
      return {
        expression,
        error: error.message
      };
    }
  }
};
