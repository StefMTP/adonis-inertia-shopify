import { BaseCommand } from "@adonisjs/core/build/standalone";
import Shopify from "@shopify/shopify-api";
import { getDatabaseShop } from "App/Helpers/DatabaseHelpers";
import { createOrUpdateWebhook } from "App/Helpers/ShopifyHelpers";
import Env from "@ioc:Adonis/Core/Env";

export default class UpdateWebhooks extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "webhooks:update";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "update webhook addresses for a shop";

  public static settings = {
    loadApp: true,
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
      if (!shop) {
        throw new Error("Shop error");
      }
      const client = new Shopify.Clients.Rest(
        shop.shopifyDomain,
        shop.accessToken
      );
      await createOrUpdateWebhook(
        `${Env.get("REDIRECT_URI")}/uninstall`,
        "app/uninstalled",
        client
      );
    } catch (err) {
      this.logger.error(err.message || err);
    }
  }
}
