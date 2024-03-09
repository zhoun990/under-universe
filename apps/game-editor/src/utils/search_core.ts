import { getObjectKeys } from "@repo/functions";
import { createEstate } from "../estate";
import { createMemo } from "solid-js";

export const search_core = (area_id: string | undefined) => {
  const { cores } = createEstate("main");
  return createMemo(
    () => {
      const key = getObjectKeys(cores()).find((k) =>
        cores()[k].areas.some((id) => id === area_id)
      );
      return key ? cores()[key] : undefined;
    },
    undefined,
    { equals: false }
  );
};
