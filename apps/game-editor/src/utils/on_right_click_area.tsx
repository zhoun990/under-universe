import { DungeonCore } from "@repo/engine";
import { createEstate } from "../estate";
import { search_core } from "./search_core";
import { N } from "@repo/functions";

export const on_right_click_area = (area_id: string, x: number, y: number) => {
  const { core_id, setEstate } = createEstate("main");
  const core = search_core(area_id)();
  if (core?.id) {
    setEstate({ area_id: "", core_id: core.id });
  } else if (core_id()) {
    setEstate({
      cores: (v) => {
        if (!v[core_id()].areas.includes(area_id)) {
          v[core_id()].areas.push(area_id);
        }
        return { ...v };
      },
    });
  } else {
    const name = prompt("コア名を入力", N.generateRandomID(6));
    if (name) {
      const core = new DungeonCore({ name, areas: [area_id] });
      setEstate({
        cores: (v) => ({ ...v, [core.id]: core }),
        area_id: "",
        core_id: core.id,
      });
    }
  }
};
