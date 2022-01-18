import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Shop from "App/Models/Shop";
import Shopify, { DataType } from "@shopify/shopify-api";

export default class ProductsController {
  public async index({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const pageLimit = request.qs().page_limit;
    const pageQuery = request.qs().page_query
      ? JSON.parse(request.qs().page_query)
      : undefined;
    const { productType, status } = request.qs();
    try {
      if (!shop || shop.isNotProperlyInstalled) {
        throw new Error("Shop doesn't exist or isn't installed");
      }
      const client = new Shopify.Clients.Rest(
        shop.shopifyDomain,
        shop.accessToken
      );
      const params = pageQuery || {
        path: "products",
        query: {
          limit: pageLimit,
          published_status: "any",
          product_type: productType,
          status: status,
        },
      };
      const res = await client.get(params);
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async productsCount({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      const client = new Shopify.Clients.Rest(
        shop.shopifyDomain,
        shop.accessToken
      );
      const res = await client.get({ path: "products/count" });
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async editTag({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const productId = request.body().id;
    const tagInput = request.body().tags;
    try {
      if (!shop || shop.isNotProperlyInstalled) {
        throw new Error("Shop doesn't exist or isn't installed");
      }
      if (!productId || !tagInput) {
        throw new Error("Missing parameters from body");
      }
      const client = new Shopify.Clients.Rest(
        shop.shopifyDomain,
        shop.accessToken
      );
      const res: any = await client.put({
        path: "products/" + productId,
        data: {
          product: { id: productId, tags: tagInput },
        },
        type: DataType.JSON,
      });
      return response.status(200).json({ newTags: res.body.product.tags });
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }
}
