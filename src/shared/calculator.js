const SUPPORTED_EXPRESSION = /^[\d+\-*/().\s]+$/;

export function evaluateExpression(expression) {
  if (typeof expression !== "string" || expression.trim() === "") {
    throw new Error("請提供要計算的 expression 字串。");
  }

  if (!SUPPORTED_EXPRESSION.test(expression)) {
    throw new Error("計算機只支援數字、空白、四則運算符號和括號。");
  }

  const parser = new CalculatorParser(expression);
  const value = parser.parseExpression();
  parser.skipSpaces();

  if (!parser.isAtEnd()) {
    throw new Error(`無法解析 expression：${expression}`);
  }

  if (!Number.isFinite(value)) {
    throw new Error("計算結果不是有效數字。");
  }

  return Number(value.toFixed(10));
}

class CalculatorParser {
  constructor(input) {
    this.input = input;
    this.index = 0;
  }

  parseExpression() {
    let value = this.parseTerm();

    while (true) {
      this.skipSpaces();

      if (this.consume("+")) {
        value += this.parseTerm();
      } else if (this.consume("-")) {
        value -= this.parseTerm();
      } else {
        return value;
      }
    }
  }

  parseTerm() {
    let value = this.parseFactor();

    while (true) {
      this.skipSpaces();

      if (this.consume("*")) {
        value *= this.parseFactor();
      } else if (this.consume("/")) {
        const divisor = this.parseFactor();
        if (divisor === 0) {
          throw new Error("不能除以零。");
        }
        value /= divisor;
      } else {
        return value;
      }
    }
  }

  parseFactor() {
    this.skipSpaces();

    if (this.consume("+")) {
      return this.parseFactor();
    }

    if (this.consume("-")) {
      return -this.parseFactor();
    }

    if (this.consume("(")) {
      const value = this.parseExpression();
      this.skipSpaces();
      if (!this.consume(")")) {
        throw new Error("括號沒有正確關閉。");
      }
      return value;
    }

    return this.parseNumber();
  }

  parseNumber() {
    this.skipSpaces();
    const start = this.index;
    let dotCount = 0;

    while (!this.isAtEnd()) {
      const char = this.input[this.index];
      if (char === ".") {
        dotCount += 1;
        if (dotCount > 1) break;
        this.index += 1;
      } else if (/\d/.test(char)) {
        this.index += 1;
      } else {
        break;
      }
    }

    if (start === this.index) {
      throw new Error("缺少數字。");
    }

    const raw = this.input.slice(start, this.index);
    if (raw === ".") {
      throw new Error("小數格式不正確。");
    }

    return Number(raw);
  }

  consume(expected) {
    if (this.input[this.index] === expected) {
      this.index += 1;
      return true;
    }
    return false;
  }

  skipSpaces() {
    while (/\s/.test(this.input[this.index] ?? "")) {
      this.index += 1;
    }
  }

  isAtEnd() {
    return this.index >= this.input.length;
  }
}
