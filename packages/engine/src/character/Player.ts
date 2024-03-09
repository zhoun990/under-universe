import { N } from "@repo/functions";
import { AIPlayer } from "./AIPlayer";
import { Character } from "./Character";
import { CharacterDataDic } from "./CharacterData";
import { GameMethods } from "../game_system/GameMethods";
import { UniversalPos } from "../game_system/UniversalPos";
import { Pos, LayerItem, Wall } from "../types";

/**キャラクターの操作を管理 */
export class Player extends Character {
  public static override characters: Record<string, Player>;
  core_id: string;

  public x = 0;
  public y = 0;
  public speed = 0;
  public name = "";
  public direction: "top" | "right" | "bottom" | "left" | "idol" = "bottom";
  public message = "";
  public updated_at = 0;
  public jumping = 0;
  public emotion = "";
  /**速度上昇倍率 */
  public movement_increase_rate = 1;
  /**Is Player Character */
  public pc = false;
  private frame = 0;
  public footsteps = 0;
  protected message_lifetime = 0; /** ms */
  public onMessageSent = (message: string, player_data: this) => {};
  public onStartPlayerPosTransition = () => {};
  protected actual_player_pos: { x: number; y: number } = { x: 0, y: 0 };
  public pos_record: { x: number; y: number }[] = [];
  public is_player_jumping = false;
  public controller = { x: 0, y: 0 };
  // public audio = CHARACTER.audio();

  constructor(initial: Partial<Player> & Pick<Player, "type" | "core_id">) {
    if (!initial) throw Error("Parameter 'initial' is undefined.");
    const dic = CharacterDataDic[initial.type][initial.class_lv || 0]();
    if (!dic)
      throw Error(
        `Can not find player's dictionary from parameter, ${{
          type: initial.type,
          class_lv: initial.class_lv || 0,
        }}.`
      );

    super({
      ...dic,
      id: initial.id || N.generateRandomID(20),
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
      this.core_id = initial.core_id;
      if (this.pc) {
        GameMethods.player_id = this.id;
      }
    } catch (error) {
      const ad = `\n:Located Player:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public getPlayerRect() {
    return {
      x: this.x,
      y: this.y,
      w: this.size.w,
      h: this.size.h,
    };
  }
  public getData() {
    const { ...player_data } = this;
    return player_data;
  }
  public replacePlayerPos(x?: number, y?: number) {
    this.onStartPlayerPosTransition();
    if (x) {
      this.x = Math.round(x);
      this.actual_player_pos.x = Math.round(x);
    }
    if (y) {
      this.y = Math.round(y);
      this.actual_player_pos.y = Math.round(y);
    }
  }
  public detect_direction() {
    if (Math.abs(this.controller.x) + Math.abs(this.controller.y) > 0) {
      if (this.controller.x > this.controller.y) {
        if (Math.abs(this.controller.x) > Math.abs(this.controller.y)) return "right";
        else return "top";
      } else if (this.controller.x < this.controller.y) {
        if (Math.abs(this.controller.x) > Math.abs(this.controller.y)) return "left";
        else return "bottom";
      }
    } //else this.direction = "idol";
    return this.direction;
  }
  public override _tick() {
    this.speed = Math.sqrt(
      this.controller.x * this.controller.x + this.controller.y * this.controller.y
    );
    this.footsteps += this.speed * 10;
    const pos: { x: number; y: number } = {
      x: this.actual_player_pos.x + this.controller.x * 14,
      y: this.actual_player_pos.y + this.controller.y * 14,
    };
    this.direction = this.detect_direction();

    //壁
    const walls = [...GameMethods.walls];
    const player_rect = this.getPlayerRect();

    Object.values(Player.characters).forEach((v) => {
      const rect = v.getPlayerRect();
      //[ToDo]距離検証
      if (v.id !== this.id) {
        walls.push(rect);
      }
    });
    const bounce = 0;
    for (let i = 0; i < walls.length; i++) {
      const rect = walls[i];
      if (N.isInsideRect(player_rect, rect)) {
        const dt = Math.abs(rect.y - (this.actual_player_pos.y + this.size.h));
        const dr = Math.abs(rect.x + rect.w - this.actual_player_pos.x);
        const db = Math.abs(rect.y + rect.h - this.actual_player_pos.y);
        const dl = Math.abs(rect.x - (this.actual_player_pos.x + this.size.w));
        const min = Math.min(dt, dr, db, dl);
        switch (min) {
          case dt: //  上側にいるとき
            pos.y = Math.min(pos.y, rect.y - this.size.h - bounce);
            break;
          case dr: // 右側にいるとき
            pos.x = Math.max(pos.x, rect.x + rect.w + bounce);
            break;
          case db: //  下側にいるとき
            pos.y = Math.max(pos.y, rect.y + rect.h + bounce);
            break;
          case dl: // 左側にいるとき
            pos.x = Math.min(pos.x, rect.x - this.size.w - bounce);
            break;
        }
      }
    }
    this.actual_player_pos = pos;
    const newPlayerPos = this.gen_player_pos(pos);
    this.x = newPlayerPos.x;
    this.y = newPlayerPos.y;
    // if (this.frame_count % 10)
    //   this.valid_record.push({ ...pos, type: "move", timestamp: Date.now() });
    this.jump();
    this.walk();
    super._tick();
  }
  private gen_player_pos(pos: Pos) {
    const lastPos = this.pos_record[this.pos_record.length - 1] || pos;
    this.pos_record.push(pos);

    const lastPos2 = this.pos_record[this.pos_record.length - 2] || pos;
    const lastPos3 = this.pos_record[this.pos_record.length - 3] || pos;

    const displayX = (pos.x + lastPos.x + lastPos2.x + lastPos3.x) / 4;
    const displayY = (pos.y + lastPos.y + lastPos2.y + lastPos3.y) / 4;
    if (this.pos_record.length > 10) {
      this.pos_record.shift();
    }
    return { x: displayX, y: displayY };
  }
  public camera_pos() {
    let pos = { x: this.x, y: this.y };
    let sumX = 0,
      sumY = 0;
    let n = 8;
    for (let i = 1; i <= n; i++) {
      const lastPos = this.pos_record[this.pos_record.length - i] || pos;
      sumX += lastPos.x;
      sumY += lastPos.y;
    }
    const displayX = sumX / n + this.view_size.w * (1 / 4);
    const displayY = sumY / n;
    return { x: displayX, y: displayY };
  }
  public player_center_pos(): UniversalPos<"px"> {
    return new UniversalPos("px", this.x + this.size.w / 2, this.y + this.size.h / 2);
  }
  public jump() {
    if (this.is_player_jumping) {
      if (this.jumping >= 80 && this.jumping < 82) {
        this.jumping += 1;
      } else if (this.jumping >= 82) {
        this.is_player_jumping = false;
      } else {
        this.jumping += (80 - this.jumping) / 2 + 1;
      }
    } else if (this.jumping > 0) {
      this.jumping = Math.max(0, (this.jumping || 0) - 20);
    }
  }
  // public sound(type: keyof ReturnType<typeof CHARACTER.audio>, offset = 0, pos?: Pos) {
  //   if (!pos) pos = this;
  //   const dx = this.x - pos.x;
  //   const dy = this.y - pos.y;
  //   const dist = Math.sqrt(dx * dx + dy * dy);
  //   const vol = Math.min(
  //     dist > 500 ? 0 : 1,
  //     Math.min(1, Math.max(0, (1 + offset) / (dist === 0 ? 1 : dist / 50)))
  //   );
  //   this.audio[type].playSound(vol, Math.max(-1, Math.min(1, this.x / pos.x)));
  // }
  private messageBuilder(): LayerItem[] {
    const createMessageView = (message: string) => {
      let w = 210;
      let h = 65;
      let top = 0;
      if (message.length <= 10) {
        w -= (10 - message.length) * (w / 10);
        h /= 2;
        top = 30;
      }
      w += 10;
      h += 5;
      return {
        width: w,
        height: h,
        top,
      };
    };
    const messageStyle = createMessageView(this.message || "");
    const baseY = this.y - this.size.h * (3 / 4) - this.jumping - 70 + messageStyle.top;
    const items: LayerItem[] = [];
    // if (user.message) {
    //   items.push({
    //     type: "object" as const,
    //     layer: user.y,
    //     x: user.x - messageStyle.width / 2,
    //     y: baseY,
    //     w: messageStyle.width,
    //     h: messageStyle.height,
    //     src: BALLOON,
    //   });
    //   items.push({
    //     type: "text" as const,
    //     layer: user.y,
    //     x: user.x - messageStyle.width / 2 + 5,
    //     y: baseY + 5,
    //     w: messageStyle.width,
    //     h: messageStyle.height,
    //     src: user.message.substring(0, 10),
    //     fontSize: 21,
    //     textColor: "#2F3B57",
    //   });
    // }
    // if (user.message && user.message.substring(10, 20)) {
    //   items.push({
    //     type: "text" as const,
    //     layer: user.y,
    //     x: user.x - messageStyle.width / 2 + 5,
    //     y: baseY + 30,
    //     w: messageStyle.width,
    //     h: messageStyle.height,
    //     src: user.message?.substring(10, 20),
    //     fontSize: 21,
    //     textColor: "#2F3B57",
    //   });
    // }
    return items;
  }

  public getPlayerLayerItems(): LayerItem[] {
    //[ToDo]参照で書き換えられるようにする。毎回生成しない。
    const animation = Math.round(this.frame / 10) % 2;
    try {
      return [
        {
          type: this.pc ? "player" : "user",
          layer: this.y + this.size.h,
          x: this.x - this.view_size.w * (1 / 4),
          y: this.y - this.view_size.h * (3 / 4) - this.jumping,
          w: this.view_size.w,
          h: this.view_size.h,
          src_path: [
            "a",
            this.jumping > 0 ? "idol" : this.direction,
            this.direction === "idol" ? 0 : animation,
          ],
          objectFit: "contain",
        },
        {
          //playerの名前の表示
          type: "text",
          layer: this.y + this.size.h,
          x: this.x - this.view_size.w * (1 / 4) - 50,
          y: this.y + this.view_size.h * (1 / 4) - this.jumping,
          w: this.view_size.w + 100,
          h: this.view_size.h,
          text: this.name,
          textColor: "white",
          textAlign: "center",
        },
        ...this.messageBuilder(),
      ];
    } catch (err) {
      return [];
    }
  }
  public sendMessage(message: string) {
    this.message = message;
    this.message_lifetime = 1000 * 30;
    this.onMessageSent(message, this);
  }
  public manageMessage(delta_time: number) {
    this.message_lifetime -= delta_time;
    if (this.message_lifetime <= 0) {
      this.message_lifetime = 0;
      this.message = "";
    }
  }
  public override onAttacked(dmg: number) {
    super.onAttacked(dmg);
    // this.sound("damaged", 0, GameMethods.player());
    this.jumping = 100;
  }
  public attack() {
    // this.sound("attack", 0, GameMethods.player());
    const y =
      this.direction === "bottom"
        ? Player.BLOCK_SIZE / 2
        : this.direction === "top"
          ? -Player.BLOCK_SIZE
          : 0;
    const x =
      this.direction === "right"
        ? Player.BLOCK_SIZE / 2
        : this.direction === "left"
          ? -Player.BLOCK_SIZE
          : 0;
    const isXDirection = x !== 0;
    let closest: { value: Player | AIPlayer | null; d: number } = { value: null, d: 100 };
    const reach_area_rect = {
      x: this.x + x,
      y: this.y + y,
      w: this.size.w + (isXDirection ? Player.BLOCK_SIZE / 2 : 0),
      h: this.size.h + (isXDirection ? 0 : Player.BLOCK_SIZE / 2),
    };
    GameMethods.characters_in_rect(reach_area_rect).forEach((v) => {
      if (v.id === this.id) return;
      const d = N.distance(v, this);
      if (d < closest.d) {
        closest = { d, value: v };
      }
    });
    if (!closest.value) {
      const blockUnit = 100;
      const reachAreaBlockX = Math.floor(this.x / blockUnit);
      const reachAreaBlockY = Math.floor(this.y / blockUnit);
      let maxOverlapArea = 0;
      let maxOverlapBlock = null;

      for (let i = reachAreaBlockX - 1; i <= reachAreaBlockX + 1; i++) {
        for (let j = reachAreaBlockY - 1; j <= reachAreaBlockY + 1; j++) {
          const blockRect = {
            x: i * blockUnit,
            y: j * blockUnit,
            w: blockUnit,
            h: blockUnit,
          };
          const overlapArea = N.getOverlapRect(reach_area_rect, blockRect);
          if (overlapArea > maxOverlapArea) {
            maxOverlapArea = overlapArea;
            maxOverlapBlock = { x: i, y: j };
          }
        }
      }
      if (maxOverlapBlock) {
        const block_item = GameMethods.block_item(
          new UniversalPos("block", maxOverlapBlock.x, maxOverlapBlock.y)
        );
        if (block_item) {
          //[ToDo]距離減衰つける
          block_item.on_attacked(this.getStatus().strength);
        }
      }
      return;
    } else {
      closest.value.onAttacked(this.getStatus().strength);
    }
  }
  public getCursor() {
    const y =
      this.direction === "bottom"
        ? Player.BLOCK_SIZE
        : this.direction === "top"
          ? -Player.BLOCK_SIZE
          : 0;
    const x =
      this.direction === "right"
        ? Player.BLOCK_SIZE
        : this.direction === "left"
          ? -Player.BLOCK_SIZE
          : 0;
    const pos = this.player_center_pos();
    return new UniversalPos("px", pos.x + x, pos.y + y).to_block();
  }
  public walk() {
    if (this.footsteps > 100) {
      // this.sound("walking", -0.9);
      this.footsteps = 0;
    }
  }
}
