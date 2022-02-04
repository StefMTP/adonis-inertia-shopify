import axios from "axios";
import { RestClient } from "@shopify/shopify-api/dist/clients/rest";
import Shopify, { DataType } from "@shopify/shopify-api";

export type shop = {
  name: string;
  email: string;
  shop_owner: string;
};

export type webhook = {
  id: number;
  topic: string;
  address: string;
  format: string;
};

export const createRestClient = async (
  shopShopifyDomain: string,
  accessToken: string
) => {
  return new Shopify.Clients.Rest(shopShopifyDomain, accessToken);
};

export const createGraphQLClient = async (
  shopShopifyDomain: string,
  accessToken: string
) => {
  return new Shopify.Clients.Graphql(shopShopifyDomain, accessToken);
};

export const getScopes = async (
  shopShopifyDomain: string,
  shopAccessToken: string
): Promise<string> => {
  try {
    if (!shopShopifyDomain || !shopAccessToken) {
      throw new Error("ShopifyHelpers.getScopes: missing necessary parameters");
    }
    const res: any = await axios.get(
      `https://${shopShopifyDomain}/admin/oauth/access_scopes.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopAccessToken,
        },
      }
    );
    const accessScopes: Array<any> = res.data.access_scopes;
    let scopes: string = "";
    accessScopes.forEach((accessScope: any) => {
      scopes += `${accessScope.handle},`;
    });
    scopes = scopes.substring(0, scopes.length - 1);
    return scopes;
  } catch (err) {
    console.info(err.message || err);
    throw err;
  }
};

export const getAccessToken = async (
  shopShopifyDomain: string,
  clientId: string,
  clientSecret: string,
  code: string
) => {
  try {
    if (!shopShopifyDomain || !clientId || !clientSecret || !code) {
      throw new Error(
        "ShopifyHelpers.getAccessToken: missing necessary parameters"
      );
    }
    const res: any = await axios.post(
      `https://${shopShopifyDomain}/admin/oauth/access_token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }
    );
    if (!res) {
      throw new Error("ShopifyHelpers.getAccessToken: axios request failed");
    }
    const accessToken: string = res.data.access_token;
    if (!accessToken) {
      throw new Error(
        "ShopifyHelpers.getAccessToken: response without access token"
      );
    }
    return accessToken;
  } catch (err) {
    console.info(err.message || err);
    throw err;
  }
};

export const getShop = async (client: RestClient): Promise<shop> => {
  try {
    if (!client) {
      throw new Error("ShopifyHelpers.getShop: missing necessary parameters");
    }
    const res: any = await client.get({ path: "shop" });
    if (!res) {
      throw new Error("ShopifyHelpers.getShop: axios request failed");
    }
    const shop: any = res.body.shop;
    if (!shop) {
      throw new Error(
        "Shopifyhelpers.getShop: this shop doesn't exist in shopify"
      );
    }
    return shop;
  } catch (err) {
    console.info(err.message || err);
    throw err;
  }
};

export const hasWebhook = async (
  topic: string,
  client: RestClient
): Promise<webhook | false> => {
  try {
    if (!topic || !client) {
      throw new Error(
        "ShopifyHelpers.hasWebhook: missing necessary parameters"
      );
    }
    const res: any = await client.get({ path: "webhooks" });
    if (!res) {
      throw new Error("ShopifyHelpers.hasWebhook: request failed");
    }
    for (const webhook of res.body.webhooks) {
      if (webhook.topic === topic) {
        return webhook;
      }
    }
    return false;
  } catch (err) {
    console.info(err.message || err);
    throw err;
  }
};

export const postWebhook = async (
  path: string,
  topic: string,
  client: RestClient
): Promise<webhook> => {
  try {
    if (!path || !topic || !client) {
      throw new Error(
        "ShopifyHelpers.postWebhook: missing necessary parameters"
      );
    }
    const res: any = await client.post({
      path: "webhooks",
      data: { webhook: { topic, address: path, format: "json" } },
      type: DataType.JSON,
    });
    if (!res) {
      throw new Error("ShopifyHelpers.postWebhook: axios request failed");
    }
    const webhook: webhook = res.body.webhook;
    if (!webhook) {
      throw new Error("ShopifyHelpers.postWebhook: response without webhook");
    }
    return webhook;
  } catch (err) {
    console.info(err.message || err);
    throw err;
  }
};

export const updateWebhookPath = async (
  webhookId: number,
  path: string,
  client: RestClient
): Promise<webhook> => {
  try {
    if (!client || !webhookId || !path) {
      throw new Error(
        "ShopifyHelpers.updateWebhookPath: missing necessary parameters"
      );
    }
    const res: any = await client.put({
      path: `webhooks/${webhookId}`,
      data: { webhook: { id: webhookId, address: `${path}` } },
      type: DataType.JSON,
    });
    if (!res) {
      throw new Error("ShopifyHelpers.updateWebhookPath: axios request failed");
    }
    const webhook: webhook = res.body.webhook;
    if (!webhook) {
      throw new Error(
        "ShopifyHelpers.updateWebhookPath: response without webhook"
      );
    }
    return webhook;
  } catch (err) {
    console.info(err);
    throw err;
  }
};

export const createOrUpdateWebhook = async (
  path: string,
  topic: string,
  client: RestClient
): Promise<void> => {
  const webhookFound = await hasWebhook(topic, client);
  if (!webhookFound) {
    const webhook = await postWebhook(path, topic, client);
    if (!webhook) {
      throw new Error(
        "ShopifyHelpers.createOrUpdateWebhook: something went wrong with webhook subscription, topic: " +
          topic
      );
    }
  } else if (webhookFound && webhookFound.address !== path) {
    const webhook = await updateWebhookPath(webhookFound.id, path, client);
    if (!webhook) {
      throw new Error(
        "ShopifyHelpers.createOrUpdateWebhook: something went wrong with webhook update, topic: " +
          topic
      );
    }
  }
};

export const getAllProducts = async (client: RestClient) => {
  let res: any = await client.get({
    path: "products",
    query: {
      limit: 250,
    },
  });
  let products = res.body.products;
  while (res.pageInfo.nextPage) {
    res = await client.get(res.pageInfo.nextPage);
    products = products.concat(res.body.products);
  }
  return products;
};
