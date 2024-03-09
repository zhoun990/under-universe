import { BlockTypes } from "../field/BlockData";
import { BlockItem } from "../field/BlockItem";
import { DungeonCore } from "./DungeonCore";

export const factories: Record<
  BlockTypes,
  (core: DungeonCore, block_item: BlockItem) => void
> = {
  wall() {},
  rock() {},
  floor() {},
  magic_power_pump() {},
};
