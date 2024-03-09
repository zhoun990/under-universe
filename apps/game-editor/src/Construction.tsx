import {
  BlockDataDic,
  BlockItem,
  BlockTypes,
  DungeonCore,
  UniversalPos,
} from "@repo/engine";
import { createEstate, setEstates } from "./estate";
import { search_area } from "./utils/search_area";
import { search_core } from "./utils/search_core";
import { createSignal, createMemo, createEffect } from "solid-js";
import { getObjectKeys } from "@repo/functions";
import { ASSETS_IMPORTED } from "@repo/assets/imported";
import { color } from "./utils/color";
import { remove_block_item } from "./utils/remove_block_item";
export const Construction = ({ x, y }: { x: number; y: number }) => {
  const { block_items, construct_levels, construct, mode, setEstate } =
    createEstate("main");
  const area = search_area(x, y);
  const core = search_core(area()?.id);
  const block_item_id = createMemo(() => {
    return core()?.block_items.find((key) =>
      block_items()[key]?.pos?.is_equal(new UniversalPos("block", x, y))
    );
  });
  const block_item = createMemo(() => {
    return block_items()[block_item_id() || ""];
  });

  const muted = createMemo(() => mode() === "character");

  return (
    <div
      class="absolute top-0 left-0 flex items-center justify-center h-full w-full"
      // style={{
      //   width: size + "px",
      //   height: size + "px",
      // }}
      onClick={(e) => {
        // e.stopPropagation();
      }}
    >
      {!!block_item() && (
        <img
          draggable={false}
          src={ASSETS_IMPORTED[block_item().asset_id][block_item().lv][0]}
          alt=""
          class="h-full w-full"
        />
      )}
      {!muted() && core() && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (mode() === "construct") {
              const c = core();
              if (!c) return;

              const item = new BlockItem({
                pos: new UniversalPos("block", x, y),
                type: construct(),
                lv: construct_levels()[construct()],
                core_id: c.id,
              });
              setEstates.main({
                block_items: (v) => {
                  if (block_item()) delete v[block_item().id];
                  return { ...v, [item.id]: item };
                },
                cores: (v) => {
                  if (block_item()) {
                    const t = v[block_item().core_id];
                    t.block_items = t.block_items.filter((id) => id !== block_item().id);
                  }
                  v[c.id].block_items.push(item.id);
                  return { ...v, [c.id]: v[c.id] };
                },
              });
            } else {
              setEstate({ mode: "construct" });
            }
          }}
          class={
            "p-1 items-center flex bg-green-500/25 justify-center rounded-full absolute w-[40px] h-[40px] bottom-3 " +
            (block_item() ? "" : "")
          }
        >
          +
        </div>
      )}
      {!muted() && !!block_item() && (
        <div
          class="absolute bg-black/25 right-1 top-1 p-2 rounded-full w-[25px] h-[25px] flex items-center justify-center text-[12px]"
          onClick={(e) => remove_block_item(block_item())}
        >
          -
        </div>
      )}
    </div>
  );
};
export const Constructor = () => {
  const { mode, setEstate } = createEstate("main");
  return (
    <>
      {mode() === "construct" && (
        <div class="bottom-0 left-0 w-screen fixed h-[100px] bg-slate-500 z-50 flex overflow-x-auto">
          {getObjectKeys(BlockDataDic).map((key) => (
            <BlockItemPanel type={key} />
          ))}
          <div
            class="absolute bg-black/50 right-1 top-1 p-2 rounded-full w-[30px] h-[30px] flex items-center justify-center"
            onClick={() => setEstate({ mode: "tile" })}
          >
            x
          </div>
        </div>
      )}
    </>
  );
};
const BlockItemPanel = ({ type }: { type: BlockTypes }) => {
  const { construct_levels, construct, setEstate } = createEstate("main");
  0;
  const level = () => construct_levels()[type];
  const set_level = (lv: number) => {
    setEstate({ construct_levels: (v) => ({ ...v, [type]: lv }) });
  };
  return (
    <div
      class="w-[100px] h-full bg-secondary border-4 flex-shrink-0"
      style={{ "border-color": construct() === type ? color.primary : "transparent" }}
      onClick={() => {
        setEstate({ construct: type });
      }}
    >
      <div class="flex absolute bg-black/50 w-[100px] bottom-0">
        <div class="grow px-1 overflow-hidden">
          {BlockDataDic[type]?.[level()]().asset_id}
        </div>
        <div class="px-1 flex-shrink-0">{level()}</div>
        {Math.min(BlockDataDic[type].length - 1, level() + 1) !== level() && (
          <div
            class="cursor-pointer px-1 border flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              set_level(level() + 1);
            }}
          >
            ↑
          </div>
        )}
        {Math.max(0, level() - 1) !== level() && (
          <div
            class="cursor-pointer px-1 border flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              set_level(level() - 1);
            }}
          >
            ↓
          </div>
        )}
      </div>
      <img
        src={ASSETS_IMPORTED[type][level()][0]}
        alt=""
        class="rounded"
        draggable={false}
      />
    </div>
  );
};
