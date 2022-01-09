import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Shop from "App/Models/Shop";
import Shopify from "@shopify/shopify-api";

export default class ProductsController {
  public async index({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      if (
        !shop ||
        !shop.isInstalled ||
        !shop.accessToken ||
        shop.accessToken === ""
      ) {
        throw new Error("Shop doesn't exist or isn't installed");
      }
      const client = new Shopify.Clients.Rest(
        shop.shopifyDomain,
        shop.accessToken
      );

      const res = await client.get({
        path: "products",
        query: { published_status: "any" },
      });
      return response.status(200).json(res.body);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }
}
