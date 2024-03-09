import { UniversalPos } from "@repo/engine";
import { getObjectKeys } from "@repo/functions";
import { createEstate } from "../estate";
import { createMemo } from "solid-js";

export const search_area = (x: number, y: number) => {
  const { areas } = createEstate("main");

  const pos = new UniversalPos("block", x, y);
  const key = getObjectKeys(areas()).find((k) =>
    areas()[k].block.some(
      (v) => v.to_block().x === pos.to_block().x && v.to_block().y === pos.to_block().y
    )
  );
  return createMemo(() => (key ? { ...areas()[key], id: key } : undefined));
};
