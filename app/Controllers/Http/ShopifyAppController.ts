import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { getDatabaseShop } from "App/Helpers/DatabaseHelpers";
import Env from "@ioc:Adonis/Core/Env";
import { Cache, setCache, getCache } from "App/Helpers/Cache";
import { nanoid } from "nanoid";
import {
  getAccessToken,
  getScopes,
  getShop,
  hasWebhook,
  postWebhook,
  updateWebhookPath,
} from "App/Helpers/ShopifyHelpers";
import Shop from "App/Models/Shop";

export default class ShopifyAppController {
  public async app({ request, response, inertia }: HttpContextContract) {
    try {
      const requestQuery = request.qs();
      if (!requestQuery) {
        throw new Error(
          "ShopifyAppController.app: something went wrong with retrieving request query parameters"
        );
      }
      // check if there is a shop with such domain
      // if it exists, then serve the application
      // if it doesn't (or is not installed / doesn't have an access token), then start the OAuth and installation
      const shop = await getDatabaseShop(requestQuery.shop);
      if (
        shop &&
        shop.isInstalled &&
        shop.accessToken &&
        shop.accessToken !== ""
      ) {
        response.header(
          "Content-Security-Policy",
          `frame-ancestors 'self' https://${shop.shopifyDomain}`
        );
        return inertia.render("Home", {
          redirectUri: Env.get("REDIRECT_URI"),
          shop: shop.shopifyDomain,
        });
      }
      // save the scopes and the state value for the next step of the OAuth
      const initialScopes: string = "read_products";
      const state: string = nanoid();
      const cache: Cache = {
        scopes: initialScopes,
        state: state,
      };
      await setCache(requestQuery.shop, cache);
      // send a redirect to the authorization URL
      return response.redirect(
        `https://${requestQuery.shop}/admin/oauth/authorize?client_id=${Env.get(
          "API_KEY"
        )}&scope=${initialScopes}&redirect_uri=${Env.get(
          "REDIRECT_URI"
        )}/auth/callback&state=${state}&grant_options[]=`
      );
    } catch (err) {
      console.log(err);
      return response.status(400).json({ message: err });
    }
  }

  public async auth_callback({ request, response }: HttpContextContract) {
    try {
      const requestQuery = request.qs();
      if (!requestQuery || !requestQuery.shop || !requestQuery.state) {
        throw new Error(
          "ShopifyAppController.auth_callback: something went wrong with retrieving request query parameters"
        );
      }
      // continue with the process if indeed the shop is not installed
      let shop = await getDatabaseShop(requestQuery.shop);
      if (
        !shop ||
        !shop.isInstalled ||
        !shop.accessToken ||
        shop.accessToken === ""
      ) {
        // send a request to Shopify server for an API access token
        const accessToken = await getAccessToken(
          requestQuery.shop,
          Env.get("API_KEY"),
          Env.get("API_SECRET"),
          requestQuery.code
        );
        // check if there are uninstall webhooks already set up, if not create them or update their address if it is incorrect
        // * the uninstall webhook will fire a post request that we can handle to set a shop as uninstalled
        const path = `${Env.get("REDIRECT_URI")}/uninstall`;
        const uninstallWebhook = await hasWebhook(
          requestQuery.shop,
          accessToken,
          Env.get("API_VERSION")
        );
        if (!uninstallWebhook) {
          const webhook = await postWebhook(
            requestQuery.shop,
            accessToken,
            Env.get("API_VERSION")
          );
          if (!webhook) {
            throw new Error(
              "ShopifyAppController.auth_callback: something went wrong with webhook subscription"
            );
          }
        } else if (uninstallWebhook && uninstallWebhook.address !== path) {
          const webhook = await updateWebhookPath(
            requestQuery.shop,
            accessToken,
            Env.get("API_VERSION"),
            uninstallWebhook.id,
            path
          );
          if (!webhook) {
            throw new Error(
              "ShopifyAppController.auth_callback: something went wrong with webhook update"
            );
          }
        }
        // retrieve shop details from the REST API and store them in our database
        const shopifyShop = await getShop(
          requestQuery.shop,
          accessToken,
          Env.get("API_VERSION")
        );
        shop = await Shop.updateOrCreate(
          { shopifyDomain: requestQuery.shop },
          {
            shopifyDomain: requestQuery.shop,
            host: requestQuery.host,
            shopName: shopifyShop.name,
            email: shopifyShop.email,
            owner: shopifyShop.shop_owner,
            isInstalled: true,
            accessToken,
          }
        );
        // update cache
        const cache = await getCache(shop.shopifyDomain);
        const newScopes = await getScopes(shop.shopifyDomain, accessToken);
        await setCache(shop.shopifyDomain, { ...cache, scopes: newScopes });
        // OAuth and installation is done, redirect the user to the application
        return response.redirect(
          `https://${shop.shopifyDomain}/admin/apps/${Env.get("APP_HANDLE")}`
        );
      }
    } catch (err) {
      console.log(err);
      return response.status(400).json({ message: err });
    }
  }

  public async uninstall({ request, response }: HttpContextContract) {
    // this route should only be hit by the webhook with an 'apps/uninstalled' topic
    // when the webhooks sends a POST request to this route, the shop is marked as uninstalled
    try {
      if (!request.body().shopifyShopDomain) {
        throw new Error(
          "ShopifyAppController.uninstall: something went wrong with retrieving request body parameters"
        );
      }
      const shop = await getDatabaseShop(request.body().shopifyShopDomain);
      if (!shop) {
        throw new Error(
          "ShopifyAppController.uninstall: invalid shop shopify domain"
        );
      }
      await shop.merge({ isInstalled: false, accessToken: "" }).save();
      return response.status(200).json({});
    } catch (err) {
      return response.status(400).json({ message: err });
    }
  }

  public async credentials({ request, response }: HttpContextContract) {
    try {
      if (!request.qs().shop) {
        throw new Error(
          "ShopifyAppController.credentials: missing shop from request query"
        );
      }
      const shop = await Shop.findBy("shopifyDomain", request.qs().shop);
      if (
        !shop ||
        !shop.isInstalled ||
        !shop.accessToken ||
        shop.accessToken === ""
      ) {
        throw new Error(
          "ShopifyAppController.credentials: shop not found in database"
        );
      }
      const credentials = {
        apiKey: Env.get("API_KEY"),
        host: shop.host,
      };
      return response.status(200).json(credentials);
    } catch (err) {
      console.log(err);
      return response.status(500).json({
        message: err,
      });
    }
  }
}
