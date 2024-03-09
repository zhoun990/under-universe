import { getObjectKeys } from "@repo/functions";
import { DataManager } from "../game_system/DataManager";
import { AssetId, Materials } from "../types";
/** Player側への依存禁止 */
export class BlockData extends DataManager {
  readonly type: BlockTypes;
  readonly asset_id: AssetId;
  readonly w: number = 0;
  readonly h: number = 0;
  /**設置座標の補正用 */
  readonly relative_x: number = 0;
  /**設置座標の補正用 */
  readonly relative_y: number = 0;
  /** 画像の上から何%で奥行き判定を行うかの値。 0 <= n <= 1 */
  readonly layer_ratio: number = 0;
  readonly break_able: boolean = true;
  /**break_threshold以上のダメージを何度耐えられるか */
  readonly default_durability: number = 1;
  /**施設を破壊するのに必要な1撃あたりのダメージ */
  readonly break_threshold: number = 0;
  readonly rebuild_able: boolean = true;
  /**自動回復までのframe数。負の値は自動回復無効 */
  readonly default_auto_recovery_cooltime: number = -1;
  readonly build_cost: Materials = {};
  /**frame*/
  build_duration: number = 0;
  wall:
    | {
        id: string;
        relative_x: number;
        relative_y: number;
        w: number;
        h: number;
      }
    | boolean = true;
  action?: {
    id: string;
    code: string;
    optional: boolean;
    relative_x: number;
    relative_y: number;
    w: number;
    h: number;
  };
  /**break_threshold以上のダメージを何度耐えられるか */
  durability = this.default_durability;
  lv = 0;
  auto_recovery_cooltime = this.default_auto_recovery_cooltime;
  constructor(_initial: Partial<BlockData> & Pick<BlockData, "type" | "asset_id">) {
    super(_initial.id, "block_item");
    const { ...initial } = _initial;
    this.type = initial.type;
    this.asset_id = initial.asset_id;

    getObjectKeys(initial).forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(this, key) &&
        Object.prototype.hasOwnProperty.call(initial, key)
      ) {
        //@ts-expect-error
        this[key] = initial[key];
      }
    });
  }

  is_min_lv() {
    return this.lv <= 0;
  }
  is_max_lv() {
    return this.lv >= BlockDataDic[this.type].length - 1;
  }

  get_block_data_from_dic() {
    return BlockDataDic[this.type][this.lv]();
  }
  static get_block_data_from_dic(type: BlockTypes, lv = 0) {
    return BlockDataDic[type][lv]();
  }
}
export const BlockDataDic = {
  floor: [
    () =>
      new BlockData({
        type: "floor",
        asset_id: "floor",
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
        lv: 0,
        break_able: false,
        wall: false,
      }),
  ],
  wall: [
    () =>
      new BlockData({
        type: "wall",
        asset_id: "wall",
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
        lv: 0,
        break_able: false,
        default_auto_recovery_cooltime: 1000,
      }),
    () =>
      new BlockData({
        type: "wall",
        asset_id: "wall",
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
        lv: 1,
        durability: 2,
        break_threshold: 1,
        rebuild_able: true,
      }),
    () =>
      new BlockData({
        type: "wall",
        asset_id: "wall",
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
        lv: 2,
        durability: 4,
        break_threshold: 50,
        default_auto_recovery_cooltime: 1000,
        rebuild_able: true,
      }),
  ],
  rock: [
    () =>
      new BlockData({
        type: "rock",
        asset_id: "rock",
        lv: 0,
        rebuild_able: false,
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
      }),
  ],
  magic_power_pump: [
    () =>
      new BlockData({
        type: "magic_power_pump",
        asset_id: "magic_power_pump",
        lv: 0,
        rebuild_able: true,
        w: BlockData.BLOCK_SIZE,
        h: BlockData.BLOCK_SIZE,
        build_cost: { liquid_magic_power: 100 },
        build_duration: 1000,
      }),
  ],
};
export type BlockTypes = "rock" | "wall" | "floor" | "magic_power_pump";
