import { N, getObjectKeys } from "@repo/functions";

import { DataManager } from "./DataManager";
import { UniversalPos } from "./UniversalPos";
import { Area } from "../area/Area";
import { AIPlayer } from "../character/AIPlayer";
import { DungeonCore } from "../d_core/DungeonCore";
import { BlockItem } from "../field/BlockItem";
import { LayerItem, FieldAction, Wall, Rect, SaveData } from "../types";

export class GameMethods extends DataManager {
  public static override characters: Record<string, AIPlayer>;
  public static override block_items: Record<string, BlockItem>;
  static override cores: Record<string, DungeonCore>;
  static override areas: Record<string, Area>;

  /**BlockItemの配列 */
  public static flat_block_items: BlockItem[] = [];
  public static layered_items: LayerItem[] = [];
  public static actions: FieldAction[] = [];
  public static walls: Array<Wall> = [];

  protected static require_regenerate_static = {
    flat_block_items: true,
    walls: true,
    layered_items: true,
    actions: true,
  };
  /**BlockItemが増減した際に実行。初期化時の負荷軽減のため、constructorに組み込まない */
  public static generate_static_items() {
    getObjectKeys(this.require_regenerate_static).forEach((key) => {
      if (this.require_regenerate_static[key]) {
        console.log("^_^ ::: file: GameMethods.ts:29 ::: key:\n", key);
        this[key] = [];
      }
    });
    if (this.require_regenerate_static.flat_block_items) {
      const player = this.player();
      this.flat_block_items = getObjectKeys(this.block_items).map(
        (key) => this.block_items[key]
      );
      // .filter((v) => {
      //   const pos = v.pos.to_px();
      //   return (
      //     Math.abs(pos.x + v.w / 2 - (player.x + player.size.w / 2)) <=
      //       GameMethods.SCREEN.WIDTH / 2 + v.w / 2 + 200 &&
      //     Math.abs(pos.y + v.h / 2 - (player.y + player.size.h / 2)) <=
      //       GameMethods.SCREEN.HEIGHT / 2 + v.h / 2 + 200
      //   );
      // });
      console.log(
        "^_^ ::: file: GameMethods.ts:34 :::  this.flat_block_items :\n",
        this.flat_block_items
      );
    }

    for (const block_item of this.flat_block_items) {
      getObjectKeys(this.require_regenerate_static).forEach((key) => {
        if (this.require_regenerate_static[key]) {
          switch (key) {
            case "actions":
              if (block_item.action && !block_item.destroyed && !block_item.disabled) {
                const { x, y } = block_item.pos.to_px();
                this.actions.push({
                  ...block_item.action,
                  x: x + block_item.action.relative_x,
                  y: y + block_item.action.relative_y,
                });
              }
              break;
            case "layered_items":
              this.layered_items.push(block_item.layered_item);
              break;
            case "walls":
              if (!block_item.destroyed && block_item.wall) {
                const { x, y } = block_item.pos.to_px();
                const wall = { w: block_item.w, h: block_item.h, x, y };
                if (typeof block_item.wall !== "boolean") {
                  wall.w = block_item.wall.w;
                  wall.h = block_item.wall.h;
                  wall.x += block_item.wall.relative_x;
                  wall.y += block_item.wall.relative_y;
                } else {
                  wall.x += block_item.relative_x;
                  wall.y += block_item.relative_y;
                }
                this.walls.push(wall);
              }
              break;
            case "flat_block_items":
              break;
            default:
              console.warn("No handler for key of  require_regenerate_static");
              break;
          }
        }
      });
    }
    this.require_regenerate_static = {
      flat_block_items: false,
      walls: false,
      layered_items: false,
      actions: false,
    };
  }
  public static require_regenerate(
    ...keys: (keyof typeof this.require_regenerate_static | "all")[]
  ) {
    if (keys.includes("all")) {
      getObjectKeys(this.require_regenerate_static).forEach((key) => {
        this.require_regenerate_static[key] = true;
      });
    } else {
      (keys as (keyof typeof this.require_regenerate_static)[]).forEach((key) => {
        this.require_regenerate_static[key] = true;
      });
    }
  }
  public static player() {
    if (!this.characters[this.player_id]) {
      throw new Error("GameMethods.player() called before initialize");
    }
    return this.characters[this.player_id];
  }
  public static player_core() {
    const core_id = this.player().core_id;
    if (!this.cores[core_id]) {
      throw new Error("GameMethods.player() called before initialize");
    }
    return this.cores[core_id];
  }

  public static characters_in_rect(rect: Rect) {
    return Object.keys(this.characters)
      .filter((k) => N.isInsideRect(this.characters[k].getPlayerRect(), rect))
      .map((k) => this.characters[k]);
  }
  public static layers(): LayerItem[] {
    const player = this.player();
    function calculateAdjustedScale(
      value: number,
      base: number,
      adjustment: number = 1
    ): number {
      const min = Math.abs(value) * adjustment;
      const denominator = base + min;
      if (Math.abs(denominator) < 1e-7) {
        return (value + min) / 1e-7; // 分母が0になるのを避けるための処理
      }
      return (value + min) / denominator;
    }

    return [
      ...this.layered_items,
      ...Object.entries(this.characters).flatMap(([key, value], i) => {
        if (
          Math.abs(value.x + value.size.w / 2 - (player.x + player.size.w / 2)) <=
            GameMethods.SCREEN.WIDTH / 2 + value.size.w / 2 &&
          Math.abs(value.y + value.size.h / 2 - (player.y + player.size.h / 2)) <=
            GameMethods.SCREEN.HEIGHT / 2 + value.size.h / 2
        ) {
          return value.getPlayerLayerItems();
        }
        return [];
      }),
    ]
      .map((value, i) => {
        const scale = 1;
        //   calculateAdjustedScale(
        //   value.y,
        //   player.getPlayerLayerItems()[0].y,
        //   5
        // );
        const dy = (player.y - value.y - (player.y - value.y) * scale) / 2;
        const dx = player.x - value.x - (player.x - value.x) * scale;
        return {
          ...value,
          w: Math.floor(value.w * scale),
          h: Math.floor(value.h * scale),
          x: Math.floor(value.x + dx),
          y: Math.floor(value.y + dy),
          layer: Math.floor(value.layer * 100) / 100,
          key: String(i) + value.type,
        };
      })
      .sort((a, b) => a.layer - b.layer);
  }
  public static block_item(pos: UniversalPos<any>): BlockItem | undefined {
    const { x, y } = pos.to_block();
    throw new Error("未実装");
    // return this.block_items['']
  }
  public static cursor() {
    const player = this.player();
    const pos = player.player_center_pos();
    const y =
      player.direction === "bottom"
        ? GameMethods.BLOCK_SIZE
        : player.direction === "top"
          ? -GameMethods.BLOCK_SIZE
          : 0;
    const x =
      player.direction === "right"
        ? GameMethods.BLOCK_SIZE
        : player.direction === "left"
          ? -GameMethods.BLOCK_SIZE
          : 0;
    return new UniversalPos("px", pos.x + x, pos.y + y).to_block();
  }
  public static block_item_on_cursor_pos() {
    const block = this.cursor().to_block();
    return this.block_item(block);
  }
  public static gen_save_data(): SaveData {
    const characters = Object.keys(this.characters).reduce(
      (acc, v) => {
        throw new Error("未実装");
        // const { audio, ...character } = this.characters[v];
        // acc[v] = character;
        // return acc;
      },
      {} as SaveData["characters"]
    );
    return {
      characters,
      block_items: this.block_items,
      cores: this.cores,
      areas: this.areas,
    };
  }
}
