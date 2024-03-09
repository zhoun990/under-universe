import { createSignal } from "solid-js";
import { AIPlayer } from "@repo/engine";
import { createEstate } from "./estate";
import { ASSETS_IMPORTED } from "@repo/assets/imported";
import { getObjectKeys } from "@repo/functions";

export const Characters = () => {
  const { characters, setEstate, core_id } = createEstate("main");
  return (
    Object.entries(characters())
      // .filter(([k, v]) => (core_id() ? v.core_id === core_id() : !v.core_id))
      .map(([k, v]) => {
        return <Character player_id={k} />;
      })
  );
};
const Character = ({ player_id: player_id }: { player_id: string }) => {
  const { mode, characters, setEstate, core_id, cores } = createEstate("main");
  const player = () => characters()[player_id];
  const [pos, setPos] = createSignal({ x: player().x, y: player().y });
  const [info, setInfo] = createSignal(true);
  const [lastPos, setLastPos] = createSignal({ x: player().x, y: player().y });
  const [startPos, setStartPos] = createSignal<null | { x: number; y: number }>(null);

  return (
    <>
      {mode() === "character" ? (
        <div
          class="absolute border-[3px] border-primary rounded-lg"
          style={{
            left: pos().x - player().view_size.w * (1 / 4) + "px",
            top: pos().y - player().view_size.h * (3 / 4) + "px",
            width: player().view_size.w + "px",
            height: player().view_size.h + "px",
          }}
          onClick={() => {
            // setEstate({ character_id: k });
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const start = startPos();
            if (!!start) {
              console.log("^_^ ::: file: App.tsx:426 ::: start:\n", start);
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
            player().x = pos().x;
            player().y = pos().y;
          }}
        >
          <img
            draggable={false}
            src={ASSETS_IMPORTED[player().type]["bottom"][0]}
            alt=""
            class="h-full w-full"
          />
          <div
            class="absolute bottom-1 left-1 bg-black/50 p-1 px-2 rounded-full max-w-full overflow-hidden"
            onClick={() => {
              setInfo((prev) => !prev);
            }}
          >
            {player().name}
          </div>
          <div
            class="absolute top-1 left-1 bg-black/50 p-1 rounded-full max-w-full overflow-hidden"
            onClick={() => {
              setEstate({
                characters: (characters) => {
                  Object.entries(characters).forEach(([k, v]) => {
                    if (v.pc) {
                      v.pc = false;
                    }
                  });
                  characters[player_id].pc = true;
                  return { ...characters };
                },
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={player().pc ? "yellow" : "none"}
              viewBox="0 0 24 24"
              stroke-width={1.5}
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </div>
          <div
            class="absolute top-[40px] left-1 bg-black/50 p-1 rounded-full max-w-full overflow-hidden"
            onClick={() => {
              setInfo((prev) => !prev);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width={1.5}
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          {info() && (
            <div class="absolute top-0 right-[100%] z-50 h-full bg-green-500 w-[300px] p-1">
              <div class="flex w-full">
                <input
                  type="text"
                  value={player().name}
                  class="p-1 grow"
                  onChange={(e) => {
                    setEstate({
                      characters: (characters) => {
                        characters[player_id].name = e.target.value;
                        return { ...characters };
                      },
                    });
                  }}
                />
                <select
                  class="w-1/3 bg-black"
                  value={player().core_id}
                  onChange={(e) => {
                    setEstate({
                      cores: (cores) => {
                        cores[player().core_id].characters = cores[
                          player().core_id
                        ].characters.filter((k) => k !== player_id);
                        cores[e.target.value].characters.push(player_id);
                        return { ...cores };
                      },
                      characters: (characters) => {
                        characters[player_id].core_id = e.target.value;
                        return { ...characters };
                      },
                    });
                  }}
                >
                  {Object.entries(cores()).map(([k, v]) => (
                    <option value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <select
                class="w-1/3 bg-black"
                value={player().type}
                onChange={(e) => {
                  setEstate({
                    characters: (characters) => {
                      characters[player_id] = new AIPlayer({
                        type: e.target.value as any,
                        core_id: player().core_id,
                        name: player().name,
                        lv: player().lv,
                        exp: player().exp,
                        skill_point: player().skill_point,
                        skills: player().skills,
                      });
                      return { ...characters };
                    },
                  });
                }}
              >
                {Object.entries(cores()).map(([k, v]) => (
                  <option value={v.id}>{v.name}</option>
                ))}
              </select>
              <div class="flex w-full flex-wrap">
                <div class="mt-1">
                  <label html-for="lv">Lv</label>
                  <input
                    id="lv"
                    type="number"
                    class="mx-1 w-[40px] text-center"
                    value={player().lv}
                    onChange={(e) => {
                      setEstate({
                        characters: (characters) => {
                          characters[player_id].lv = Number(e.target.valueAsNumber);
                          return { ...characters };
                        },
                      });
                    }}
                  />
                </div>
                <div class="mt-1">
                  <label html-for="exp">Exp</label>
                  <input
                    id="exp"
                    type="number"
                    class="mx-1 w-[40px] text-center"
                    value={player().exp}
                    onChange={(e) => {
                      setEstate({
                        characters: (characters) => {
                          characters[player_id].exp = Number(e.target.valueAsNumber);
                          return { ...characters };
                        },
                      });
                    }}
                  />
                </div>
                <div class="mt-1">
                  <label html-for="sp">SP</label>
                  <input
                    id="sp"
                    type="number"
                    class="mx-1 w-[40px] text-center"
                    value={player().skill_point}
                    onChange={(e) => {
                      setEstate({
                        characters: (characters) => {
                          characters[player_id].skill_point = Number(
                            e.target.valueAsNumber
                          );
                          return { ...characters };
                        },
                      });
                    }}
                  />
                </div>
                {getObjectKeys(player().skills).map((k) => (
                  <div class="mt-1">
                    <label html-for={k}>
                      {
                        {
                          hp: "HP",
                          strength: "STR",
                          defense: "DEF",
                          auto_recovery_cooltime: "REC",
                        }[k]
                      }
                    </label>
                    <input
                      id={k}
                      type="number"
                      class="mx-1 w-[40px] text-center"
                      value={player().skills[k]}
                      onChange={(e) => {
                        setEstate({
                          characters: (characters) => {
                            characters[player_id].skills[k] = Number(
                              e.target.valueAsNumber
                            );
                            return { ...characters };
                          },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
              <div class="flex w-full">
                <label html-for="hp">HP</label>
              </div>
              <div class="flex w-full">
                <input
                  id="hp"
                  type="number"
                  class="mr-1 w-[40px] text-center"
                  value={player().hp}
                  onChange={(e) => {
                    setEstate({
                      characters: (characters) => {
                        characters[player_id].hp = Number(e.target.valueAsNumber);
                        return { ...characters };
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          class="absolute bg-red-500/25 p-1 px-2 rounded-full overflow-hidden flex justify-center items-center pointer-events-none"
          style={{
            left: pos().x + "px",
            top: pos().y + "px",
            width: player().size.w + "px",
            height: player().size.h + "px",
          }}
          onClick={() => {
            // setEstate({ character_id: k });
          }}
        >
          {player().name}
        </div>
      )}
    </>
  );
};
