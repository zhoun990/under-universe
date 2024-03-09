import { initEstate } from "@e-state/solid";
import { GameMethods, BlockTypes } from "@repo/engine";

export const { createEstate, setEstates } = initEstate(
  {
    main: {
      areas: GameMethods.areas,
      cores: GameMethods.cores,
      characters: GameMethods.characters,
      block_items: GameMethods.block_items,
      construct: "floor" as BlockTypes,
      construct_levels: {
        floor: 0,
        wall: 0,
        rock: 0,
        magic_power_pump: 0,
      } as Record<BlockTypes, number>,
      mode: "tile" as "tile" | "construct" | "character",
      core_colors: {} as Record<string, string>,
      area_id: "",
      core_id: "",
      character_id: "",
    },
    persist: {},
  },
  {
    persist: ["persist"],
  }
);
