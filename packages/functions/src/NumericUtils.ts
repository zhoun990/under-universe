/**
 * 2つの数値を指定された演算子で比較します。
 * @param n1 最初の数値
 * @param operator 比較に使用する演算子
 * @param n2 2番目の数値
 * @returns 比較結果（真偽値）
 */
const c = (a: number, operator: ">" | "<" | ">=" | "<=", b: number): boolean => {
  switch (operator) {
    case "<": {
      return a < b;
    }
    case ">": {
      return a > b;
    }
    case "<=": {
      return a <= b;
    }
    case ">=": {
      return a >= b;
    }
  }
};
export class N {
  static isNumber(n: any): n is number {
    return !isNaN(n) && typeof n === "number";
  }
  /**
   * 指定された演算子を使用して、2つまたは3つの数値を比較します。
   * @param n1 最初の数値
   * @param operator1 最初の数値と2番目の数値の間で使用する演算子
   * @param n2 2番目の数値
   * @param operator2 2番目の数値と3番目の数値の間で使用する演算子
   * @param n3 3番目の数値
   * @returns 比較結果（真偽値）
   */
  static minmax(min: number, n: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }
  /**
   * 指定された演算子を使用して、2つまたは3つの数値を比較します。
   * @param n1 最初の数値
   * @param operator1 最初の数値と2番目の数値の間で使用する演算子
   * @param n2 2番目の数値
   * @param operator2 2番目の数値と3番目の数値の間で使用する演算子
   * @param n3 3番目の数値
   * @returns 比較結果（真偽値）
   */
  static compare(
    n1: number,
    operator1: "<" | "<=",
    n2: number,
    operator2?: "<" | "<=",
    n3?: number
  ): boolean {
    if (operator2 && n3 !== undefined)
      return c(n1, operator1, n2) && c(n2, operator1, n3);
    else return c(n1, operator1, n2);
  }
  /**
   * 指定された桁数で数値を四捨五入する
   * @param value 丸めたい数値
   * @param precision 丸める桁数
   * @returns 丸められた数値
   */
  static round(value: number, precision = 1) {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }
  /**
   * 指定された桁数で数値を書式化する。
   * 1,000以上の場合は1,000あたり"1k"、
   * 1,000,000以上の場合は1,000,000あたり"1M"として表示する。
   * @param num 書式化する数値
   * @returns 書式化された文字列
   */
  static formatNumber(num: number, round = 1): string {
    if (num >= 100000) {
      return (
        N.round(num / 1000000, round).toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }) + "M"
      );
    } else if (num >= 100) {
      return (
        N.round(num / 1000, round).toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }) + "K"
      );
    } else {
      return N.round(num, round).toLocaleString("en-US");
    }
  }
  /**
   *return a number(min <= n <= max)
   */
  static random(min: number, max: number) {
    max++;
    return Math.floor(Math.random() * (Math.max(max, min) - min) + min);
  }
  /** listのlengthが0の場合、undefinedを返す。
   */
  static pick<T>(list: Array<T>) {
    // if (!list) return undefined;
    return list[N.random(0, list.length - 1)];
  }
  static generateRandomID(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  }
  static distance(pos1: { x: number; y: number }, pos2: { x: number; y: number }) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static isInsideRect(
    pos: { x: number; y: number; w: number; h: number },
    rect: { x: number; y: number; w: number; h: number }
  ) {
    const noOverlap =
      pos.x + pos.w < rect.x ||
      rect.x + rect.w < pos.x ||
      pos.y + pos.h < rect.y ||
      rect.y + rect.h < pos.y;
    // If these conditions are not met, there must be an overlap
    return !noOverlap;
  }
  static getOverlapRect(
    rect1: { x: number; y: number; w: number; h: number },
    rect2: { x: number; y: number; w: number; h: number }
  ) {
    const xOverlap = Math.max(
      0,
      Math.min(rect1.x + rect1.w, rect2.x + rect2.w) - Math.max(rect1.x, rect2.x)
    );
    const yOverlap = Math.max(
      0,
      Math.min(rect1.y + rect1.h, rect2.y + rect2.h) - Math.max(rect1.y, rect2.y)
    );
    return xOverlap * yOverlap;
  }
}
