import { createEstate } from "../estate";

export const on_click_area = (id: string, x: number, y: number) => {
  const { area_id, setEstate } = createEstate("main");
  if (area_id() === id) {
    setEstate({ area_id: "" });
  } else {
    setEstate({ area_id: (v) => (v === id ? "" : id), core_id: "" });
  }
};
