import axios from "axios";
import Env from "@ioc:Adonis/Core/Env";

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

export const getShop = async (
  shopShopifyDomain: string,
  shopAccessToken: string,
  apiVersion: string
) => {
  try {
    if (!shopShopifyDomain || !shopAccessToken || !apiVersion) {
      throw new Error("ShopifyHelpers.getShop: missing necessary parameters");
    }
    const res: any = await axios.get(
      `https://${shopShopifyDomain}/admin/api/${apiVersion}/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopAccessToken,
        },
      }
    );
    if (!res) {
      throw new Error("ShopifyHelpers.getShop: axios request failed");
    }
    const shop: any = res.data.shop;
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
  shopShopifyDomain: string,
  accessToken: string,
  apiVersion: string
) => {
  try {
    if (!shopShopifyDomain || !accessToken || !apiVersion) {
      throw new Error(
        "ShopifyHelpers.hasWebhook: missing necessary parameters"
      );
    }
    const res = await axios.get(
      `https://${shopShopifyDomain}/admin/api/${apiVersion}/webhooks.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    if (!res) {
      throw new Error("ShopifyHelpers.getWebhooks: axios request failed");
    }
    for (const webhook of res.data.webhooks) {
      if (webhook.topic === "app/uninstalled") {
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
  shopShopifyDomain: string,
  accessToken: string,
  apiVersion: string
) => {
  try {
    if (!shopShopifyDomain || !accessToken || !apiVersion) {
      throw new Error(
        "ShopifyHelpers.hasWebhook: missing necessary parameters"
      );
    }
    const res = await axios.post(
      `https://${shopShopifyDomain}/admin/api/${apiVersion}/webhooks.json`,
      {
        webhook: {
          topic: "app/uninstalled",
          address: `${Env.get("REDIRECT_URI")}/uninstall`,
          format: "json",
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    if (!res) {
      throw new Error("ShopifyHelpers.postWebhook: axios request failed");
    }
    const webhook: any = res.data.webhook;
    if (!webhook) {
      throw new Error("ShopifyHelpers.postWebhook: response without webhook");
    }
    return webhook;
  } catch (err) {}
};

export const updateWebhookPath = async (
  shopShopifyDomain: string,
  accessToken: string,
  apiVersion: string,
  webhookId: number,
  path: string
) => {
  try {
    if (
      !shopShopifyDomain ||
      !accessToken ||
      !apiVersion ||
      !webhookId ||
      !path
    ) {
      throw new Error(
        "ShopifyHelpers.updateWebhookPath: missing necessary parameters"
      );
    }
    const res: any = await axios.put(
      `https://${shopShopifyDomain}/admin/api/${apiVersion}/webhooks/${webhookId}.json`,
      {
        webhook: {
          id: webhookId,
          address: `${path}`,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    if (!res) {
      throw new Error("ShopifyHelpers.postWebhook: axios request failed");
    }
    const webhook: any = res.data.webhook;
    if (!webhook) {
      throw new Error("ShopifyHelpers.postWebhook: response without webhook");
    }
    return webhook;
  } catch (err) {
    console.info(err);
    throw err;
  }
};
