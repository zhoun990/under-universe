import { BlockItem } from "@repo/engine";
import { setEstates } from "../estate";

export const remove_block_item = (block_item: BlockItem) => {
  if (!block_item) return;
  setEstates.main({
    cores: (v) => {
      const t = v[block_item.core_id];
      t.block_items = t.block_items.filter((id) => id !== block_item.id);
      return { ...v, [t.id]: t };
    },
    block_items: (v) => {
      delete v[block_item.id];
      return { ...v };
    },
  });
};
