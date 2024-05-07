export abstract class DataManager {
  public static SCREEN = { WIDTH: 0, HEIGHT: 0 };
  public static readonly BLOCK_SIZE = 100;
  public static characters: Record<string, DataManager> = {};
  public static block_items: Record<string, DataManager> = {};
  public static cores: Record<string, DataManager> = {};
  public static areas: Record<string, DataManager> = {};
  public static characters_templates: Record<string, DataManager> = {};
  public static frame = 0;

  public static player_id = "";
  public readonly id: string = "";
  protected constructor(
    id?: string,
    type?: "character" | "block_item" | "core" | "areas"
  ) {
    try {
      if (!id) return;
      this.id = id;
      if (type === "character") {
        DataManager.characters[id] = this;
      } else if (type === "core") {
        DataManager.cores[id] = this;
      } else if (type === "block_item") {
        DataManager.block_items[id] = this;
      } else if (type === "areas") {
        DataManager.areas[id] = this;
      }
    } catch (error) {
      const ad = `\n:Located DataManager:constructor`;
      if (error instanceof Error) error.message += ad;
      else error += ad;
      throw error;
    }
  }
  public static remove_character(id: string) {
    delete this.characters[id];
  }
  public static remove_block_item(id: string) {
    delete this.block_items[id];
  }
}
