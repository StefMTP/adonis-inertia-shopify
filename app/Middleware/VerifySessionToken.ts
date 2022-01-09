import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Shop from "App/Models/Shop";
import Env from "@ioc:Adonis/Core/Env";

export default class VerifySessionToken {
  private verify(JSONWebToken: string, apiKey: string, apiSecret: string): any {
    try {
      const payload: any = jwt.verify(JSONWebToken, apiSecret);
      if (!payload) {
        throw new Error(
          "VerifySessionToken.verify: something went wrong with token verification"
        );
      }
      if (
        !payload ||
        payload.exp < Date.now() / 1000 ||
        payload.nbf > Date.now() / 1000 ||
        !payload.iss.includes(payload.dest) ||
        payload.aud !== apiKey ||
        !payload.sub ||
        !payload.iss
      ) {
        throw new Error(
          "VerifySessionToken.verify: something went wrong with token payload verification"
        );
      }
      return payload;
    } catch (err) {
      console.info(err);
      throw err;
    }
  }

  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const authorizationHeader: string | undefined =
        request.headers().authorization;
      if (!authorizationHeader) {
        throw new Error(
          "VerifySessionToken.handle: missing authorization header"
        );
      }
      const JWT: string = authorizationHeader.substring(
        7,
        authorizationHeader.length
      );
      const payload: any = this.verify(
        JWT,
        Env.get("API_KEY"),
        Env.get("API_SECRET")
      );
      if (!payload) {
        throw new Error("VerifySessionToken.handle: no payload given from JWT");
      }
      const shopShopifyDomain: string = payload.dest.substring(
        8,
        payload.dest.length
      );
      if (!shopShopifyDomain) {
        throw new Error(
          "VerifySessionToken.handle: no dest field in JWT payload"
        );
      }
      const shop: Shop | null = await Shop.findBy(
        "shopifyDomain",
        shopShopifyDomain
      );
      if (!shop) {
        throw new Error("VerifySessionToken.handle: no shop found");
      }
      request.updateBody({
        ...request.body(),
        shop: shop,
      });
    } catch (err) {
      console.info(err.message || err);
      response.status(500).json({
        message: err.message,
      });
      return;
    }
    await next();
  }
}
