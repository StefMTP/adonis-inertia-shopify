import { BaseCommand } from "@adonisjs/core/build/standalone";
import { getDatabaseShop } from "App/Helpers/DatabaseHelpers";

export default class GetToken extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "token";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Get shop access token";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {
    const { default: Shop } = await import("App/Models/Shop");
    try {
      const shops = await Shop.all();
      if (!shops.length) {
        throw new Error("No shops found");
      }
      const shopDomain = await this.prompt.autocomplete(
        "Enter the shop domain",
        shops.map((shop) => shop.shopifyDomain)
      );
      const shop = await getDatabaseShop(shopDomain);
      if (shop) {
        this.logger.info(`Token: ${shop.accessToken}`);
      }
    } catch (err) {
      this.logger.error(err.message || err);
    }
  }
}
