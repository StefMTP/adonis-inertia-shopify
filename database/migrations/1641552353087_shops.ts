import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Shops extends BaseSchema {
  protected tableName = "shops";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements("id");
      table.string("shopify_domain");
      table.string("shop_name");
      table.string("host");
      table.string("owner");
      table.string("email");
      table.boolean("is_installed");
      table.string("access_token");
      table.timestamps();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
