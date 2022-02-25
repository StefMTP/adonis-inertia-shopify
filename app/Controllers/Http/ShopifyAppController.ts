import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { getDatabaseShop } from "App/Helpers/DatabaseHelpers";
import Env from "@ioc:Adonis/Core/Env";
import { nanoid } from "nanoid";
import {
  createOrUpdateWebhook,
  getAccessToken,
  getScopes,
  getShop,
} from "App/Helpers/ShopifyHelpers";
import Shop from "App/Models/Shop";
import Shopify, { DataType } from "@shopify/shopify-api";
import axios from "axios";

export default class ShopifyAppController {
  public async app({
    request,
    response,
    session,
    inertia,
  }: HttpContextContract) {
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
      if (shop && !shop.isNotProperlyInstalled) {
        response.header(
          "Content-Security-Policy",
          `frame-ancestors 'self' https://${shop.shopifyDomain}`
        );
        return inertia.render("Index", {
          redirectUri: Env.get("REDIRECT_URI"),
          shop: shop.shopifyDomain,
        });
      }
      // save the scopes and the state value for the next step of the OAuth
      const initialScopes: string =
        "read_products,write_products,write_shipping";
      const state: string = nanoid();
      const cache = {
        scopes: initialScopes,
        state: state,
      };
      session.put(requestQuery.shop, cache);
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

  public async auth_callback({
    request,
    response,
    session,
  }: HttpContextContract) {
    try {
      const requestQuery = request.qs();
      if (!requestQuery || !requestQuery.shop || !requestQuery.state) {
        throw new Error(
          "ShopifyAppController.auth_callback: something went wrong with retrieving request query parameters"
        );
      }
      // continue with the process if indeed the shop is not installed
      let shop = await getDatabaseShop(requestQuery.shop);
      if (!shop || shop.isNotProperlyInstalled) {
        // send a request to Shopify server for an API access token
        const accessToken = await getAccessToken(
          requestQuery.shop,
          Env.get("API_KEY"),
          Env.get("API_SECRET"),
          requestQuery.code
        );
        // check if there are uninstall webhooks already set up, if not create them or update their address if it is incorrect
        // * the uninstall webhook will fire a post request that we can handle to set a shop as uninstalled
        const client = new Shopify.Clients.Rest(requestQuery.shop, accessToken);
        await createOrUpdateWebhook(
          `${Env.get("REDIRECT_URI")}/uninstall`,
          "app/uninstalled",
          client
        );
        // create carrier service for the shop and app
        const carrierRes = await client.post({
          path: "carrier_services",
          data: {
            carrier_service: {
              name: "Carrier Test Service",
              callback_url: `${Env.get("REDIRECT_URI")}/carrier_callback`,
              service_discovery: true,
            },
          },
          type: DataType.JSON,
        });
        console.log({ carrierRes });
        // retrieve shop details from the REST API and store them in our database
        const shopifyShop = await getShop(client);
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
        const cache = session.get(shop.shopifyDomain);
        const newScopes = await getScopes(requestQuery.shop, accessToken);
        session.put(shop.shopifyDomain, { ...cache, scopes: newScopes });
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
      if (!shop || shop.isNotProperlyInstalled) {
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

  public async settings({ response }: HttpContextContract) {
    try {
      return response.status(200).json({ pageLimit: Env.get("PAGE_LIMIT") });
    } catch (err) {
      console.log(err);
      return response.status(500).json({
        message: err,
      });
    }
  }

  public async carrierCallback({ request, response }: HttpContextContract) {
    console.log(request.body());
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json?address=5%20Pavlou%20Mela%20Pefki&key=" +
        Env.get("GOOGLE_KEY")
    );
    // console.log(res.data.results[0].geometry.location.lat);
    // console.log(res.data.results[0].geometry.location.lng);
    return response.status(200).json({
      rates: [
        {
          service_name: "Box Now",
          description: "Fragkoklisias 23",
          service_code: "ab1234",
          currency: "EUR",
          total_price: "350",
        },
        {
          service_name: "Box Now 2",
          description: "Cockoras 56",
          service_code: "ab1235",
          currency: "EUR",
          total_price: "350",
        },
        {
          service_name: "Box Now 3",
          description: "Leforos Alvanias 125",
          service_code: "ab1236",
          currency: "EUR",
          total_price: "350",
        },
      ],
    });
  }
}
