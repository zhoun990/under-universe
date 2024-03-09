import { Area } from "./area/Area";
import { AIPlayer } from "./character/AIPlayer";
import { DEFAULT_MATERIALS } from "./d_core/DEFAULT_MATERIALS";
import { DungeonCore } from "./d_core/DungeonCore";
import { BlockItem } from "./field/BlockItem";
import { UniversalPos } from "./game_system/UniversalPos";

export type LayerItem = {
  type: "user" | "player" | "object" | "text";
  layer: number;
  src_path?: [AssetId, string | number, number];
  text?: string;
  fontSize?: number;
  textColor?: string;
  objectFit?: "cover" | "contain" | "stretch" | "repeat" | "center";
  textAlign?: "left" | "center" | "right";
  key?: string;
} & Omit<ImageData, "asset_id">;
export type Rect = {
  w: number;
  h: number;
} & Pos;
export interface Pos {
  x: number;
  y: number;
}
export type Wall = { id?: string } & Rect;
export type FieldAction = { id: string; code: string; optional?: boolean } & Rect;
export type AssetId = "a" | "field" | "wall" | "rock" | "floor" | "magic_power_pump";
export type ImageData = {
  /** 画像の上から何%で奥行き判定を行うかの値。
   * 0 <= n <= 1 */
  layer_ratio?: number;
  asset_id: AssetId;
  as_wall?: boolean;
} & Rect;
export type ValidRecord = {
  type: "move" | "interact";
  x: number;
  y: number;
  timestamp: number;
};
export type SaveData = {
  characters: Record<string, AIPlayer>;
  block_items: Record<string, BlockItem>;
  cores: Record<string, DungeonCore>;
  areas: Record<string, Area>;
};
export type SummonViewSubMode = { character: ""; item: "wall" | "rock" };
export type SummonViewMode = keyof SummonViewSubMode;
export type SummonItem = {
  title: string;
  asset: any;
  action: (pos: UniversalPos<"px">) => void;
};
export type MaterialTypes = keyof typeof DEFAULT_MATERIALS;
export type Materials = {
  [key in MaterialTypes]?: number;
};
