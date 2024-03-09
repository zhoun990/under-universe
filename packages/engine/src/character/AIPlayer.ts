import { N } from "@repo/functions";
import { Player } from "./Player";
// import { GameMethods } from "@/game_system/GameMethods";
//@ts-expect-error
export class AIPlayer extends Player {
  public static override characters: Record<string, AIPlayer>;

  move_to = [{ x: 0, y: 0 }];
  relocate_cooltime = 0;
  relocated = 0;
  constructor(initial: Partial<AIPlayer> & Pick<AIPlayer, "type" | "core_id">) {
    super({
      type: initial.type,
      id: initial.id || N.generateRandomID(20),
      pc: initial.pc,
      class_lv: initial.class_lv,
      core_id: initial.core_id,
    });
    try {
      Object.keys({ ...initial }).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          Object.prototype.hasOwnProperty.call(initial, key)
        ) {
          //@ts-expect-error
          this[key] = initial[key];
        }
      });
      this.actual_player_pos = {
        x: this.x,
        y: this.y,
      };
    } catch (error) {
      const ad = `\n:Located AIPlayer:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public override _tick() {
    try {
      if (!this.pc) {
        if (this.relocate_cooltime >= 1) this.relocate_cooltime--;
        if (this.relocated > 10) {
          this.relocated = 0;
          this.replacePlayerPos(this.move_to[0].x, this.move_to[0].y);
          this.move_to.shift();
          this.move_to.push({ x: N.random(0, 500), y: N.random(0, 500) });
          // this.sound("break", 0, GameMethods.player());
          this.controller = { x: 0, y: 0 };
        } else {
          let dx = this.move_to[0].x - this.x;
          let dy = this.move_to[0].y - this.y;
          let magnitude = Math.sqrt(dx * dx + dy * dy);
          let movement_rate = 1;
          if (magnitude < 5 || this.relocated > 10) {
            this.relocated = 0;
            this.move_to.shift();
            this.move_to.push({ x: N.random(0, 500), y: N.random(0, 500) });
            dx = this.move_to[0].x - this.x;
            dy = this.move_to[0].y - this.y;
            magnitude = Math.sqrt(dx * dx + dy * dy);
            this.relocate_cooltime += 30;
          } else {
            const sum_record = this.pos_record.reduce(
              (acc, v) => {
                acc.x += v.x;
                acc.y += v.y;
                return acc;
              },
              { x: 0, y: 0 }
            );
            sum_record.x /= this.pos_record.length;
            sum_record.y /= this.pos_record.length;
            if (this.relocate_cooltime === 0 && N.distance(this, sum_record) < 3) {
              this.relocate_cooltime += 30;
              if (this.relocated > 0) this.move_to.shift();
              this.move_to.unshift({
                x: this.x + N.random(-200, 200),
                y: this.y + N.random(-200, 200),
              });
              this.relocated++;
            } else if (
              this.relocate_cooltime === 0 &&
              N.distance(this, sum_record) >= 3 &&
              N.distance(this, sum_record) < 10
            ) {
              movement_rate = 0.3;
            }
          }
          this.controller = {
            x: N.minmax(-1, dx / magnitude, 1) * movement_rate,
            y: N.minmax(-1, dy / magnitude, 1) * movement_rate,
          };
        }
      }
      super._tick();
    } catch (error) {
      console.error("^_^ ::: file: AIPlayer.ts:93 ::: error:\n", error);
    }

    // this.manageHP();
  }
  public override walk() {
    if (this.pc) {
      super.walk();
    } else {
      if (this.footsteps > 100) {
        // this.sound("walking", -0.8, GameMethods.player());
        this.footsteps = 0;
      }
    }
  }
}
