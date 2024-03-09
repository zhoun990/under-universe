import { AssetId } from "@repo/engine";
import ATop0 from "./assets/top1.png";
import ATop1 from "./assets/top2.png";
import ARight0 from "./assets/right1.png";
import ARight1 from "./assets/right2.png";
import ABottom0 from "./assets/bottom1.png";
import ABottom1 from "./assets/bottom2.png";
import ALeft0 from "./assets/left1.png";
import ALeft1 from "./assets/left2.png";
import AIdol0 from "./assets/idol1.png";
import AIdol1 from "./assets/idol2.png";
import Field0_0 from "./assets/field.png";
import Field0_1 from "./assets/field.png";
import Wall0_0 from "./assets/objects/room_kabe_ware.png";
import Wall0_1 from "./assets/objects/ishi_stone.png";
import Rock0_0 from "./assets/objects/nature_stone_iwa.png";
import Rock0_1 from "./assets/objects/nature_stone_iwa.png";
import Floor0_0 from "./assets/objects/tile.jpg";
import Floor0_1 from "./assets/objects/tile.jpg";
import MagicPowerPump0_0 from "./assets/objects/magic_power_pump.jpg";
import MagicPowerPump0_1 from "./assets/objects/magic_power_pump.jpg";

export const ASSETS_IMPORTED: Record<AssetId, Record<string | number, any[]>> = {
  a: {
    top: [ATop0, ATop1],
    right: [ARight0, ARight1],
    bottom: [ABottom0, ABottom1],
    left: [ALeft0, ALeft1],
    idol: [AIdol0, AIdol1],
  },
  field: { 0: [Field0_0], 1: [Field0_1] },
  wall: {
    0: [Wall0_0],
    1: [Wall0_1],
  },
  rock: {
    0: [Rock0_0],
    1: [Rock0_1],
  },
  floor: {
    0: [Floor0_0],
    1: [Floor0_1],
  },
  magic_power_pump: {
    0: [MagicPowerPump0_0],
    1: [MagicPowerPump0_1],
  },
};
