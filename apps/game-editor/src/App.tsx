import { createEffect, createSignal, onCleanup } from "solid-js";
import { initial_save_data } from "@repo/assets/initial_save_data";
import {
  Area,
  DungeonCore,
  AIPlayer,
  BlockItem,
  SaveData,
  GameMethods,
  UniversalPos,
} from "@repo/engine";
import { invoke } from "@tauri-apps/api";
import { createEstate } from "./estate";
import { Constructor } from "./Construction";
import { search_area } from "./utils/search_area";
import { Tile } from "./Tile";
import { on_click_blank_area } from "./utils/on_click_blank_area";
import { Characters } from "./Characters";
import { remove_block_item } from "./utils/remove_block_item";
function App() {
  const { mode, areas, characters, cores, setEstate, core_colors, block_items } =
    createEstate("main");
  const [pos, setPos] = createSignal({ x: 0, y: 0 });
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });
  const [startPos, setStartPos] = createSignal<null | { x: number; y: number }>(null);
  const [xl, setXl] = createSignal(0);
  const [yl, setYl] = createSignal(0);

  const [characterId, setCharacterId] = createSignal("");
  const save_data = initial_save_data as unknown as SaveData;
  Object.entries(save_data.areas).forEach(([k, v]) => {
    new Area(v);
  });
  Object.entries(save_data.cores).forEach(([k, v]) => {
    new DungeonCore(v);
  });
  Object.entries(save_data.characters).forEach(([k, v]) => {
    new AIPlayer(v);
  });
  Object.entries(save_data.block_items).forEach(([k, v]) => {
    new BlockItem(v);
  });
  createEffect(() => {
    Object.entries(cores()).forEach(([k, core]) => {
      const color =
        core_colors()[core.id] || "#" + Math.floor(Math.random() * 16777215).toString(16);
      if (core_colors()[core.id] !== color) {
        setEstate({ core_colors: (v) => ({ ...v, [core.id]: color }) });
      }
    });
  });
  createEffect(() => {
    setXl(
      Object.entries(areas()).reduce((p, [k, v]) => {
        const { x } = v.block.reduce((a, b) => (a.x > b.x ? a : b));
        return p > x ? p : x;
      }, 0) + 2
    );
    setYl(
      Object.entries(areas()).reduce((p, [k, v]) => {
        const { y } = v.block.reduce((a, b) => (a.y > b.y ? a : b));
        return p > y ? p : y;
      }, 0) + 2
    );
  });
  const muted = () => mode() === "character";

  return (
    <div class="w-screen h-screen flex flex-row select-none">
      <div class="w-full h-full flex flex-col">
        <div
          class="grow bg-black overflow-hidden relative"
          onMouseMove={(e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const start = startPos();
            if (!!start) {
              setPos({
                x: lastPos().x + (mouseX - start.x),
                y: lastPos().y + (mouseY - start.y),
              });
            }
          }}
          onMouseDown={(e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            setStartPos({ x: mouseX, y: mouseY });
          }}
          onMouseUp={() => {
            setStartPos(null);
            setLastPos({ ...pos() });
          }}
          onMouseLeave={() => {
            setStartPos(null);
            setLastPos({ ...pos() });
          }}
          onClick={() => {
            setEstate({ area_id: "", core_id: "" });
            setCharacterId("");
          }}
          oncontextmenu={(e) => {
            e.preventDefault();
          }}
        >
          <div class="absolute" style={{ top: pos().y + "px", left: pos().x + "px" }}>
            {Array(xl())
              .fill(0)
              .map((_, x) =>
                Array(yl())
                  .fill(0)
                  .map((_, y) => {
                    const area = search_area(x, y)();
                    if (area) {
                      return <Tile x={x} y={y} />;
                    }
                    const constructs = Object.values(block_items()).filter((v) =>
                      v.pos.is_equal(new UniversalPos("block", x, y))
                    );

                    return (
                      <div
                        class={
                          "absolute bg-slate-500 " +
                          (constructs.length > 0
                            ? "border-4 border-red-600"
                            : "border border-black")
                        }
                        style={{
                          top: y * GameMethods.BLOCK_SIZE + "px",
                          left: x * GameMethods.BLOCK_SIZE + "px",
                          width: GameMethods.BLOCK_SIZE + "px",
                          height: GameMethods.BLOCK_SIZE + "px",
                          opacity: muted() ? 0 : 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEstate({ area_id: "", core_id: "" });
                        }}
                        oncontextmenu={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            on_click_blank_area(x, y);
                          }}
                          class={
                            "items-center flex bg-blue-500/25 justify-center rounded-full absolute top-1 left-1 w-[40px] h-[40px]"
                          }
                        >
                          +
                        </div>
                        {constructs.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              constructs.forEach((v) => {
                                remove_block_item(v);
                              });
                            }}
                            class="items-center flex bg-red-600/50 justify-center rounded-full absolute top-1 right-1 w-[40px] h-[40px]"
                          >
                            x
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            <Characters />
          </div>
        </div>
        {characterId() &&
          (() => {
            const character = characters()[characterId()];
            return (
              <div
                class="bg-slate-600 h-1/4 flex flex-col border-t"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div class="flex">
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => {
                      character.name = e.target.value;
                    }}
                    class="m-2"
                  />
                  <input
                    type="text"
                    value={character.id}
                    onChange={(e) => {
                      //@ts-expect-error
                      character.id = e.target.value;
                    }}
                    class="m-2"
                  />
                  <button
                    class="m-2 ml-auto"
                    onClick={() => {
                      setCharacterId("");
                    }}
                  >
                    X
                  </button>
                </div>
                <div class="flex">
                  <input
                    type="text"
                    value={character.core_id}
                    onChange={(e) => {
                      character.core_id = e.target.value;
                    }}
                    class="m-2"
                  />
                </div>
                <div>type:{character.type}</div>
                <div>class_lv:{character.class_lv}</div>
                <div>
                  <button
                    onClick={() => {
                      character.pc = !character.pc;
                      setEstate({
                        characters: (v) => ({ ...v }),
                      });
                    }}
                  >
                    pc: {character.pc ? "true" : "false"}
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
      <div
        class="fixed hover:right-0 right-[-65px] duration-75 top-[20px] bg-primary w-[100px] h-[40px] flex items-center rounded-l-lg"
        onClick={() => {
          const save_data: SaveData = {
            characters: characters(),
            block_items: block_items(),
            cores: cores(),
            areas: areas(),
          };
          Object.entries(save_data.cores).forEach(([k, v]) => {
            v.block_items = v.block_items.reduce((pv, v) => {
              if (!save_data.block_items[v]) {
                return pv;
              }
              return [...pv, v];
            }, [] as string[]);
          });
          save_data.block_items = Object.entries(save_data.block_items).reduce(
            (pv, [k, v]) => {
              if (
                Object.entries(save_data.cores).some(([_, core]) =>
                  core.block_items.includes(k)
                )
              ) {
                return { ...pv, [k]: v };
              }
              return pv;
            },
            {}
          );
          invoke("write_file", {
            fileString: "export const initial_save_data = " + JSON.stringify(save_data),
          }).then((res) => {
            console.log("^_^ ::: file: App.tsx:40 ::: res:\n", res);
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width={1.5}
          stroke="currentColor"
          class="w-6 h-6 mx-2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        セーブ
      </div>
      <div
        class="fixed hover:right-0 right-[-65px] duration-75 top-[70px] bg-primary w-[100px] h-[40px] flex items-center rounded-l-lg"
        onClick={() => {
          setEstate({ mode: "tile" });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width={1.5}
          stroke="currentColor"
          class={"w-6 h-6 mx-2 " + (mode() === "tile" ? " text-secondary" : "")}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525"
          />
        </svg>
        タイル
      </div>
      <div
        class="fixed hover:right-0 right-[-65px] duration-75 top-[120px] bg-primary w-[100px] h-[40px] flex items-center rounded-l-lg"
        onClick={() => {
          setEstate({ mode: "construct" });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width={1.5}
          stroke="currentColor"
          class={"w-6 h-6 mx-2 " + (mode() === "construct" ? " text-secondary" : "")}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
          />
        </svg>
        建築
      </div>
      <div
        class="fixed hover:right-0 right-[-65px] duration-75 top-[170px] bg-primary w-[100px] h-[40px] flex items-center rounded-l-lg"
        onClick={() => {
          setEstate({ mode: "character" });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width={1.5}
          stroke="currentColor"
          class={"w-6 h-6 mx-2 " + (mode() === "character" ? " text-secondary" : "")}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
        キャラ
      </div>
      {/* <div
        class="bg-slate-600 w-1/5 h-full flex flex-col border-l"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >

        <div>
          {coreId() && (
            <div class="p-2">
              <div>コア</div>
              <input
                type="text"
                value={cores()[coreId()].id}
                onChange={(e) => {
                  //@ts-expect-error
                  cores()[coreId()].id = e.target.value;
                }}
                class="w-full"
              />
            </div>
          )}
          <div>キャラクター</div>
          <button
            class="m-3"
            onClick={() => {
              if (!coreId()) return;
              const name = prompt("キャラクター名を入力");
              if (!name) return;
              const character = new AIPlayer({ type: "a", core_id: coreId(), name });
              setEstate({
                characters: (v) => {
                  return { ...v, [character.id]: character };
                },
                cores: (cores) => {
                  cores[coreId()].characters.push(character.id);
                  return cores;
                },
              });
            }}
          >
            追加
          </button>
          {Object.entries(characters())
            .filter(([k, v]) => (coreId() ? v.core_id === coreId() : !v.core_id))
            .map(([k, v]) => {
              return (
                <div
                  class="border-t last:border-b overflow-hidden"
                  onClick={() => {
                    setCharacterId(k);
                  }}
                >
                  <div>{v.id}</div>
                  <div>{v.name}</div>
                </div>
              );
            })}
        </div>
      </div> */}
      <Constructor />
    </div>
  );
}
export default App;
