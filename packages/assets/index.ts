import { AssetId } from "@repo/engine";
export const ASSETS: Record<AssetId, Record<string | number, any[]>> = {
  a: {
    top: [require("./assets/top1.png"), require("./assets/top2.png")],
    right: [require("./assets/right1.png"), require("./assets/right2.png")],
    bottom: [require("./assets/bottom1.png"), require("./assets/bottom2.png")],
    left: [require("./assets/left1.png"), require("./assets/left2.png")],
    idol: [require("./assets/idol1.png"), require("./assets/idol2.png")],
  },
  field: { 0: [require("./assets/field.png")], 1: [require("./assets/field.png")] },
  wall: {
    0: [require("./assets/objects/room_kabe_ware.png")],
    1: [require("./assets/objects/ishi_stone.png")],
  },
  rock: {
    0: [require("./assets/objects/nature_stone_iwa.png")],
    1: [require("./assets/objects/nature_stone_iwa.png")],
  },
  floor: {
    0: [require("./assets/objects/tile.jpg")],
    1: [require("./assets/objects/tile.jpg")],
  },
  magic_power_pump: {
    0: [require("./assets/objects/magic_power_pump.jpg")],
    1: [require("./assets/objects/magic_power_pump.jpg")],
  },
};
