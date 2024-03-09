import { Area } from "../area/Area";
import { AIPlayer } from "../character/AIPlayer";
import { CharacterTypes, CharacterDataDic } from "../character/CharacterData";
import { BlockDataDic } from "../field/BlockData";
import { BlockItem } from "../field/BlockItem";
import { DataManager } from "../game_system/DataManager";
import { GameMethods } from "../game_system/GameMethods";
import { DEFAULT_MATERIALS } from "./DEFAULT_MATERIALS";
import { factories } from "./factories";
import { N, getObjectKeys } from "@repo/functions";

export class DungeonCore extends DataManager {
  public static override characters: Record<string, AIPlayer>;
  public static override block_items: Record<string, BlockItem>;
  static override cores: Record<string, DungeonCore>;
  static override areas: Record<string, Area>;
  protected internal_frame = 0;
  protected last_tick_frame = 0;
  public name = "";
  public materials = { ...DEFAULT_MATERIALS };
  public max_materials = { ...DEFAULT_MATERIALS };
  public produce_materials = { ...DEFAULT_MATERIALS };
  public produce_materials_correction = { ...DEFAULT_MATERIALS };
  public hp: [number, max_value: number] = [0, 0];
  public summon_capacity: number = 1;
  public summon_capacity_used: number = 0;
  public characters_preset: { name: string; type: CharacterTypes; classLevel: number }[] =
    [];
  public available_characters: {
    name: string;
    type: CharacterTypes;
    classLevel: number;
  }[] = [];
  public characters: string[] = [];
  public block_items: string[] = [];
  public areas: string[] = [];
  constructor(initial: Partial<DungeonCore>) {
    super(initial.id || N.generateRandomID(20), "core");
    try {
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
      const ad = `\n:Located DungeonCore:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public add_character(initial: Partial<AIPlayer> & Pick<AIPlayer, "type">) {
    const character_summon_capacity =
      CharacterDataDic[initial.type][initial.class_lv || 0]().summon_capacity;
    if (this.summon_capacity < this.summon_capacity_used + character_summon_capacity) {
      alert("召喚上限を超えています");
      return null;
    }
    this.summon_capacity_used += character_summon_capacity;
    const character = new AIPlayer({ ...initial, core_id: this.id });

    this.characters.push(character.id);
    character.on_dead = () => {
      this.remove_character(character.id);
    };
    return character;
  }
  public remove_character(id: string) {
    this.characters = this.characters.filter((v) => v !== id);
    this.summon_capacity_used -= DungeonCore.characters[id].summon_capacity;

    DungeonCore.remove_character(id);
  }
  public add_block_item(data: Partial<BlockItem> & Pick<BlockItem, "pos" | "type">) {
    if (data instanceof BlockItem) {
      console.warn("Do NOT initialize it outside BlockItem class");
    }
    //[ToDo]エリア所有チェック
    const dic_data = BlockDataDic[data.type][data.lv || 0]();
    let build_able = true;
    getObjectKeys(dic_data.build_cost).forEach((k) => {
      if (this.materials[k] < (dic_data.build_cost[k] || 0)) build_able = false;
    });
    if (!build_able) return null;
    getObjectKeys(dic_data.build_cost).forEach((k) => {
      const cost = dic_data.build_cost[k];
      if (cost && cost > 0) this.materials[k] -= cost;
    });
    const item = new BlockItem({ ...data, core_id: this.id });
    this.block_items.push(item.id);
    GameMethods.require_regenerate("all");
    return item;
  }
  public remove_block_item(id: string) {
    this.block_items = this.block_items.filter((v) => v !== id);
    DungeonCore.block_items[id].remove();
  }
  public add_area({ id }: Pick<Area, "id">) {
    //エリアがない場合はnew、あったら履歴追加
    DungeonCore.areas[id].owner_history.push({
      owned_frame: Area.frame,
      core_id: this.id,
    });
    this.areas.push(id);
    return DungeonCore.areas[id];
  }
  public remove_area(id: string) {
    this.areas = this.areas.filter((v) => v !== id);
    DungeonCore.areas[id].owner_history.push({
      owned_frame: DungeonCore.frame,
      core_id: "",
    });
  }
  public static tick(frame: number) {
    Object.keys(this.cores).forEach((key) => {
      this.cores[key].tick(frame);
    });
  }
  protected tick(frame: number) {
    this.block_items.forEach((key) => {
      const block_item = DungeonCore.block_items[key];
      if (!block_item) {
        throw new Error("block_item is not found! id:" + key + ", core:" + this.id);
      }
      if (block_item.durability <= 0) {
        block_item.durability = 0;
        block_item.destroyed = true;
      }
      if (!block_item.destroyed && !block_item.disabled) {
        if (
          block_item.default_auto_recovery_cooltime >= 0 &&
          block_item.default_durability > block_item.durability
        ) {
          block_item.auto_recovery_cooltime--;
          if (block_item.auto_recovery_cooltime <= 0) {
            block_item.auto_recovery_cooltime = block_item.default_auto_recovery_cooltime;
            block_item.durability++;
          }
        }
        factories[block_item.type](this, block_item);
      }
    });
    if (this.internal_frame % 10 === 0) {
      this.materials.liquid_magic_power += 0;
      if (this.materials.liquid_magic_power > this.max_materials.liquid_magic_power) {
        this.materials.liquid_magic_power = this.max_materials.liquid_magic_power;
      }
    }
    this.characters.forEach((key) => {
      //[ToDo]キャラ同士の衝突をコントローラーの値補正で再現
      DungeonCore.characters[key]._tick();
    });
    this.last_tick_frame = frame;
    this.internal_frame++;
  }
}
