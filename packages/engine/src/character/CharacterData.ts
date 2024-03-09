import { getObjectKeys } from "@repo/functions";
import { DataManager } from "../game_system/DataManager";
import { BlockItem } from "../field/BlockItem";
import CHARACTERS_DATA from "./CHARACTERS_DATA.json";
export type CharacterTypes = "a";
/**キャラクターのテンプレ作成用Class */
export class CharacterData extends DataManager {
  public static override block_items: Record<string, BlockItem>;
  public readonly type: CharacterTypes;
  public readonly size = { w: 0, h: 0 };
  public readonly view_size = { w: 0, h: 0 };
  public readonly max_hp: number = 1;
  /**攻撃力->dmg */
  public readonly strength: number = 1;
  /**防御力,百分率,1のとき減衰無し、0のときダメージ無効化 */
  public readonly defense: number = 1;
  public readonly class_lv: number = 0;
  public readonly max_lv: number = 1;
  public readonly skill_point_per_level: number = 0;
  public readonly exp_per_lv: number = 0;
  /**自動回復までのtick数。負の値は自動回復無効 */
  public readonly default_auto_recovery_cooltime: number = -1;
  public readonly max_skills = {
    hp: 0,
    strength: 0,
    defense: 0, //5
    auto_recovery_cooltime: 0,
  };
  public readonly skills_effects = {
    hp: 0,
    strength: 0,
    defense: 0, //-0.1
    auto_recovery_cooltime: 0,
  };
  /**lレベルアップに必要な経験値総量の増加率,1のとき等幅 */
  public readonly exp_per_lv_increase_rate: number = 1;
  public readonly summon_capacity: number = 1;
  constructor(initial: Partial<CharacterData> & Pick<CharacterData, "type">) {
    super(initial.id, "character");
    try {
      this.type = initial.type;
      getObjectKeys({ ...initial }).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          Object.prototype.hasOwnProperty.call(initial, key)
        ) {
          //@ts-expect-error
          this[key] = initial[key];
        }
      });
    } catch (error) {
      const ad = `\n:Located CharacterData:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  has_upper_class() {
    return this.class_lv >= CharacterDataDic[this.type].length - 1;
  }
}
/**
 * キャラクター辞書
 * {type:キャラクター[クラス]} */

export const CharacterDataDic = {
  a: [() => new CharacterData(CHARACTERS_DATA["a"])],
};
