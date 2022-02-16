import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Shop from "App/Models/Shop";
import Shopify, { DataType } from "@shopify/shopify-api";
import {
  createGraphQLClient,
  createRestClient,
  getAllProducts,
} from "App/Helpers/ShopifyHelpers";
import { product } from "./../../Helpers/ShopifyTypes";

export default class ProductsController {
  public async productPage({ request, response }: HttpContextContract) {
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
      const params = pageQuery || {
        path: "products",
        query: {
          limit: pageLimit,
          published_status: "any",
          product_type: productType,
          status: status,
        },
      };
      const res = await createRestClient(shop.shopifyDomain, shop.accessToken)
        .then((client) => client.get(params))
        .catch((err) => {
          throw new Error(err);
        });
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async showProduct({ request, params, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const productId = params.productId;
    const fields = request.qs().fields;
    try {
      const res = await createRestClient(shop.shopifyDomain, shop.accessToken)
        .then((client) =>
          client.get({
            path: `products/${+productId}`,
            query: {
              fields,
            },
          })
        )
        .catch((err) => {
          throw new Error(err);
        });
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async productsCount({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const { productType, status } = request.qs();
    try {
      if (!shop || shop.isNotProperlyInstalled) {
        throw new Error("Shop doesn't exist or isn't installed");
      }
      const res = await createRestClient(shop.shopifyDomain, shop.accessToken)
        .then((client) =>
          client.get({
            path: "products/count",
            query: {
              product_type: productType,
              status: status,
            },
          })
        )
        .catch((err) => {
          throw new Error(err);
        });
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async totalVariantsCount({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      const totalVariantsCount = await createRestClient(
        shop.shopifyDomain,
        shop.accessToken
      )
        .then((client) => getAllProducts(client))
        .then((products: product[]) => {
          return products.reduce((sum: number, nextProduct: product) => {
            return sum + nextProduct.variants.length;
          }, 0);
        });
      return response.status(200).json({ totalVariantsCount });
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async tagProducts({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const tag = request.qs().tag;
    try {
      const productNames = await createRestClient(
        shop.shopifyDomain,
        shop.accessToken
      )
        .then((client) => getAllProducts(client))
        .then((products: product[]) => {
          return products
            .filter((product) => product.tags.includes(tag))
            .map((product) => product.title);
        });
      return response.status(200).json({ productNames });
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

  public async allShopProductTypes({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      const res = await createGraphQLClient(
        shop.shopifyDomain,
        shop.accessToken
      ).then((client) =>
        client.query({
          data: `{
          shop {
            productTypes (first: 250) {
              edges {
                  node
              }
            }
          }
        }`,
        })
      );
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async allShopProductTags({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      const res = await createGraphQLClient(
        shop.shopifyDomain,
        shop.accessToken
      ).then((client) =>
        client.query({
          data: `{
          shop {
            productTags (first: 250) {
              edges {
                  node
              }
            }
          }
        }`,
        })
      );
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async allShopCollections({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    try {
      const res = await createGraphQLClient(
        shop.shopifyDomain,
        shop.accessToken
      ).then((client) =>
        client.query({
          data: `{
          collections(first: 250) {
            edges {
              node {
                id
                title
              }
            }
          }
        }`,
        })
      );
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }

  public async collectionProducts({ request, response }: HttpContextContract) {
    const shop: Shop = request.body().shop;
    const collectionId = request.qs().collection_id;
    try {
      const res = await createGraphQLClient(
        shop.shopifyDomain,
        shop.accessToken
      ).then((client) =>
        client.query({
          data: `{
          collection(id: "${collectionId}") {
            products(first: 250) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }`,
        })
      );
      return response.status(200).json(res);
    } catch (err) {
      console.log(err.message || err);
      return response.status(500).json({ message: err.message || err });
    }
  }
}
