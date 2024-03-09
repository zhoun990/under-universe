import { getObjectKeys } from "@repo/functions";
import { CharacterData } from "./CharacterData";
/**キャラクターのステータスやレベル、スキルなど管理 */
export abstract class Character extends CharacterData {
  // static override characters: Record<string, Character>;
  public on_dead = () => {};
  public hp = this.max_hp;
  public skill_point = 0;
  public skills = {
    hp: 0,
    strength: 0,
    defense: 0,
    auto_recovery_cooltime: 0,
  };
  public lv = 1;
  public exp = 0;
  public auto_recovery_cooltime = 0;
  constructor(initial: Partial<Character> & Pick<Character, "type">) {
    super({ type: initial.type, id: initial.id });
    try {
      getObjectKeys({ ...initial }).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          Object.prototype.hasOwnProperty.call(initial, key)
        ) {
          //@ts-expect-error
          this[key] = initial[key];
        }
      });
    } catch (error) {
      const ad = `\n:Located Character:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public getStatus() {
    return {
      hp: this.max_hp + this.skills.hp * this.skills_effects.hp,
      strength: this.strength + this.skills.strength * this.skills_effects.strength,
      defense: this.defense + this.skills.defense * this.skills_effects.defense,
      auto_recovery_cooltime:
        this.auto_recovery_cooltime +
        this.skills.auto_recovery_cooltime * this.skills_effects.auto_recovery_cooltime,
    };
  }
  public consumeSkillPoint(type: keyof Character["skills"]) {
    if (this.skill_point < 1) return;
    if (this.max_skills[type] <= this.skills[type]) return;
    this.skills[type]++;
    this.skill_point--;
    if (type === "hp") {
      this.hp = this.getStatus().hp;
    }
  }
  public addExp(v: number) {
    this.exp += v;
    const lv_up_exp =
      this.exp_per_lv +
      this.exp_per_lv * (this.exp_per_lv_increase_rate - 1) * (this.lv - 1);
    if (this.max_lv >= this.lv + 1 && this.exp >= lv_up_exp) {
      this.lv++;
      this.exp -= lv_up_exp;
      this.skill_point += this.skill_point_per_level;
    }
  }

  public onAttacked(dmg: number) {
    this.hp -= Math.floor(dmg * this.getStatus().defense);
    console.log("^_^ ::: file: Character.ts:66 ::: this.hp:\n", this.hp);
  }
  protected _tick() {
    if (this.hp <= 0) {
      console.log("^_^ ::: file: Character.ts:69 ::: this.hp:\n", this.hp);
      this.on_dead();
      return;
    }
    if (this.default_auto_recovery_cooltime >= 0 && this.getStatus().hp > this.hp) {
      this.auto_recovery_cooltime--;
      if (this.auto_recovery_cooltime <= 0) {
        this.auto_recovery_cooltime = this.default_auto_recovery_cooltime;
        this.hp++;
      }
    }
  }
}
