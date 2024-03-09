import { AIPlayer } from "../character/AIPlayer";
import { BLOCK_ASSETS } from "../constants";
import { DataManager } from "../game_system/DataManager";
import { GameMethods } from "../game_system/GameMethods";
import { UniversalPos } from "../game_system/UniversalPos";
import { LayerItem } from "../types";
import { BlockData } from "./BlockData";
import { BlockDataDic } from "./BlockData";
import { N, getObjectKeys } from "@repo/functions";
export class BlockItem extends BlockData {
  public static override characters: Record<string, AIPlayer>;
  public static override block_items: Record<string, BlockItem>;

  readonly core_id: string;
  pos: UniversalPos<"block">;
  walls: string[] = [];
  disabled = false;
  destroyed = false;
  layered_item: LayerItem;
  /** 静的データを生成するにaddメソッドから呼ぶか、Instance化後に手動で
   * GameMethods.require_regenerate("layered_items", "walls", "actions");
   * を実行。
   */
  constructor(initial: Partial<BlockItem> & Pick<BlockItem, "type" | "pos" | "core_id">) {
    super({
      ...BlockDataDic[initial.type][initial.lv || 0](),
      id: initial.id || N.generateRandomID(20),
    });
    getObjectKeys({ ...initial }).forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(this, key) &&
        Object.prototype.hasOwnProperty.call(initial, key)
      ) {
        //@ts-expect-error
        this[key] = initial[key];
      }
    });
    this.core_id = initial.core_id;
    this.pos = UniversalPos.from(initial.pos).to_block();
    this.layered_item = this.generate_field_objects();
  }
  protected generate_field_objects() {
    let { x, y } = this.pos.to_px();
    x += this.relative_x;
    y += this.relative_y;
    const layered_item: LayerItem = {
      x,
      y,
      w: this.w,
      h: this.h,
      layer: y + this.h * this.layer_ratio,
      type: "object" as const,
      src_path: [this.asset_id, this.destroyed ? 1 : 0, 0],
    };
    this.layered_item = layered_item;
    return layered_item;
  }
  public on_attacked(dmg: number) {
    if (!this.break_able || dmg < this.break_threshold) return;
    this.durability -= 1;
    if (this.durability <= 0) {
      this.destroy();
    }
  }
  protected destroy() {
    if (this.rebuild_able) {
      this.destroyed = true;
      this.generate_field_objects();
      GameMethods.require_regenerate("all");
    } else {
      this.remove();
    }
  }
  public remove() {
    DataManager.remove_block_item(this.id);
    GameMethods.require_regenerate("all");
  }
  public rebuild() {
    if (this.rebuild_able && this.destroyed) {
      this.destroyed = false;
      this.generate_field_objects();
      GameMethods.require_regenerate("all");
    }
  }
}
