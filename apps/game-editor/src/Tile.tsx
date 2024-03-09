import { GameMethods, UniversalPos } from "@repo/engine";
import { createEstate } from "./estate";
import { Construction } from "./Construction";
import { search_area } from "./utils/search_area";
import { search_core } from "./utils/search_core";
import { on_right_click_area } from "./utils/on_right_click_area";
import { on_click_area } from "./utils/on_click_area";
import { createEffect, createMemo } from "solid-js";
import { remove_block_item } from "./utils/remove_block_item";

export const Tile = ({ x, y }: { x: number; y: number }) => {
  const { mode, areas, area_id, core_id, setEstate, core_colors, block_items, cores } =
    createEstate("main");

  const area_acc = search_area(x, y);
  const core_acc = search_core(area_acc()?.id);

  const border = createMemo(() => {
    return {
      bt: !!area_acc()?.block.some((a) => a.x === x && a.y === y - 1),
      bb: !!area_acc()?.block.some((a) => a.x === x && a.y === y + 1),
      bl: !!area_acc()?.block.some((a) => a.y === y && a.x === x - 1),
      br: !!area_acc()?.block.some((a) => a.y === y && a.x === x + 1),
    };
  });

  const core_border_width = createMemo(() => (core_id() === core_acc()?.id ? 6 : 3));
  const color = createMemo(() =>
    area_id() === area_acc()?.id ? "white" : core_colors()[core_acc()?.id || ""]
  );
  const muted = createMemo(() => mode() === "character");
  const constructs = createMemo(() =>
    Object.values(block_items()).filter((v) =>
      v.pos.is_equal(new UniversalPos("block", x, y))
    )
  );
  return (
    <div
      class={"absolute bg-slate-500 " + (constructs().length > 1 ? "animate-bounce" : "")}
      style={{
        top: y * GameMethods.BLOCK_SIZE + "px",
        left: x * GameMethods.BLOCK_SIZE + "px",
        width: GameMethods.BLOCK_SIZE + "px",
        height: GameMethods.BLOCK_SIZE + "px",
        "border-width": (!core_acc() ? 0 : core_border_width()) + "px",
        "border-top-color": border().bt ? "transparent" : color(),
        "border-bottom-color": border().bb ? "transparent" : color(),
        "border-left-color": border().bl ? "transparent" : color(),
        "border-right-color": border().br ? "transparent" : color(),
      }}
      onClick={(e) => {
        e.stopPropagation();
        const area = area_acc();
        if (!area) return;
        on_click_area(area.id, x, y);
      }}
      oncontextmenu={(e) => {
        e.preventDefault();
        const area = area_acc();
        if (!area) return;
        on_right_click_area(area.id, x, y);
      }}
    >
      {constructs().length > 1 && (
        <div
          class="items-center flex bg-red-600 justify-center rounded-full absolute top-1 left-1 w-[40px] h-[40px] z-50"
          onClick={(e) => {
            e.stopPropagation();
            constructs().forEach((v) => {
              remove_block_item(v);
            });
          }}
        >
          x
        </div>
      )}
      <div
        class={
          "bg-slate-500 w-full h-full " +
          (area_id() === area_acc()?.id ? "animate-pulse" : "")
        }
      >
        <div
          class="h-full w-full relative"
          onClick={(e) => {
            e.stopPropagation();
            setEstate({ area_id: "", core_id: "" });
          }}
        >
          <Construction x={x} y={y} />
        </div>
        {!muted() && (
          <div
            class={
              "absolute text-[12px] top-1 left-1 rounded-full " +
              (area_id() === area_acc()?.id
                ? "bg-red-500/50 w-[25px] h-[25px] justify-center items-center flex"
                : "bg-black/25 px-2")
            }
            onClick={(e) => {
              if (area_id() === area_acc()?.id) {
                e.stopPropagation();
                const id = area_id();
                const block_item = Object.values(block_items()).find((v) =>
                  v.pos.is_equal(new UniversalPos("block", x, y))
                );
                if (block_item) remove_block_item(block_item);
                setEstate({
                  areas: (v) => {
                    const new_blocks = v[id].block.filter(
                      (b) => !(b.x === x && b.y === y)
                    );
                    if (new_blocks.length === 0) {
                      delete v[id];
                      return { ...v };
                    }
                    const area = v[id];
                    area.block = new_blocks;
                    return {
                      ...v,
                      [id]: area,
                    };
                  },
                  area_id: (v) => {
                    if (!areas()[v]) return "";
                    return v;
                  },
                });
              }
            }}
          >
            {area_id() === area_acc()?.id ? "-" : area_acc()?.name}
          </div>
        )}
        {core_id() === core_acc()?.id ? (
          <div
            class="absolute text-[12px] bottom-1 left-1 rounded-full bg-red-500/50 w-[20px] h-[20px] justify-center items-center flex"
            onClick={() => {
              setEstate({
                cores: (v) => {
                  v[core_id()].areas = v[core_id()].areas.filter((a) => a !== area_id());
                  return { ...v };
                },
              });
            }}
          >
            -
          </div>
        ) : (
          <div
            class={
              "absolute bottom-1 left-1 rounded-full " +
              (core_acc()
                ? "text-[11px]"
                : "bg-yellow-500/25 w-[40px] h-[40px] justify-center items-center flex")
            }
            onClick={(e) => {
              e.stopPropagation();

              if (muted()) {
                setEstate({ mode: "tile" });
              }
              const area = area_acc();
              if (!area) return;
              on_right_click_area(area.id, x, y);
            }}
          >
            {core_acc()?.name || "+"}
          </div>
        )}
        <div class="absolute bottom-1 right-1 rounded-full text-[12px]">
          {x},{y}
        </div>
      </div>
    </div>
  );
};
