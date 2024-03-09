import { Player } from "../character/Player";
import { DataManager } from "./DataManager";

export class UniversalPos<T extends "block" | "px" = any> {
  constructor(
    public type: T,
    public x: number,
    public y: number
  ) {}
  static from(pos: ReturnType<UniversalPos["getData"]>) {
    return new UniversalPos(pos.type, pos.x, pos.y);
  }
  public to_px(): UniversalPos<"px"> {
    if (this.type === "px") return new UniversalPos("px", this.x, this.y);
    return new UniversalPos(
      "px",
      this.x * DataManager.BLOCK_SIZE,
      this.y * DataManager.BLOCK_SIZE
    );
  }
  public to_block(): UniversalPos<"block"> {
    if (this.type === "block") return new UniversalPos("block", this.x, this.y);
    return new UniversalPos(
      "block",
      Math.floor(this.x / DataManager.BLOCK_SIZE),
      Math.floor(this.y / DataManager.BLOCK_SIZE)
    );
  }
  public static from_player(user: Player) {
    return new UniversalPos("px", user.x, user.y);
  }
  public getData() {
    const { ...data } = this;
    return data;
  }
  public is_equal(pos: UniversalPos) {
    return this.x === pos.x && this.y === pos.y;
  }
}
