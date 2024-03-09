import { Area, UniversalPos } from "@repo/engine";
import { N } from "@repo/functions";
import { createEstate } from "../estate";

export const on_click_blank_area = (x: number, y: number) => {
  const { area_id, setEstate } = createEstate("main");
  if (!!area_id()) {
    const id = area_id();
    setEstate({
      areas: (v) => {
        const area = v[id];
        if (!area) return v;
        area.block.push(new UniversalPos("block", x, y));
        return {
          ...v,
          [id]: area,
        };
      },
    });
  } else {
    const name = prompt("新エリア名を入力", N.generateRandomID(6));
    if (name) {
      const id = N.generateRandomID(20);
      const area = new Area({
        name,
        block: [new UniversalPos("block", x, y)],
        id,
        cost: 1,
      });
      setEstate({
        areas: (v) => ({
          ...v,
          [id]: area,
        }),
        area_id: id,
      });
    }
  }
};
