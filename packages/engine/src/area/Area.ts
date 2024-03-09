import { getObjectKeys } from "@repo/functions";
import { UniversalPos } from "../game_system/UniversalPos";
import { DataManager } from "../game_system/DataManager";
export class Area extends DataManager {
  static override areas: Record<string, Area>;
  public owner_history: { owned_frame: number; core_id: string }[] = [];
  name: string;
  block: UniversalPos<"block">[] = [];
  cost = 1;
  constructor(initial: Partial<Area> & Pick<Area, "id" | "block" | "name">) {
    super(initial.id, "areas");
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
      this.name = initial.name;
      this.block = initial.block.map((v) => UniversalPos.from(v));
    } catch (error) {
      const ad = `\n:Located Area:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public owner() {
    const owner = this.owner_history[this.owner_history.length - 1];
    if (owner) return owner;
    return undefined;
  }
  public abandon() {
    this.owner_history.push({
      owned_frame: Area.frame,
      core_id: "",
    });
  }
  public own(by_core_id: string) {
    if (!!this.owner()?.core_id && this.owner()?.owned_frame === Area.frame)
      this.owner_history.pop();
    this.owner_history.push({
      owned_frame: Area.frame,
      core_id: by_core_id,
    });
  }
  public static search_area(pos: UniversalPos<any>) {
    const key = getObjectKeys(this.areas).find((k) =>
      this.areas[k].block.some(
        (v) => v.to_block().x === pos.to_block().x && v.to_block().y === pos.to_block().y
      )
    );
    if (key) return this.areas[key];
    return undefined;
  }

  public static is_owned(id_or_pos: string | UniversalPos<any>) {
    if (typeof id_or_pos === "string") return !!Area.areas[id_or_pos]?.owner()?.core_id;
    const area = this.search_area(id_or_pos);
    if (!area) return false;
    return !!Area.areas[area.id]?.owner()?.core_id;
  }
  public static is_owned_by(id_or_pos: string | UniversalPos<any>, core_id: string) {
    if (typeof id_or_pos === "string")
      return Area.areas[id_or_pos]?.owner()?.core_id === core_id;
    const area = this.search_area(id_or_pos);
    if (!area) return false;
    return Area.areas[area.id]?.owner()?.core_id === core_id;
  }
}
