import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { createHmac } from "crypto";
import Env from "@ioc:Adonis/Core/Env";

export default class VerifyWebhooksHmac {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const rawBody: string | null = request.raw();
      if (!rawBody) {
        throw new Error("VerifyWebhooksHmac.handle: missing raw body");
      }
      const hmac: string | undefined = request.header("X-Shopify-Hmac-SHA256");
      if (!hmac) {
        throw new Error("VerifyWebhooksHmac.handle: headers have no hmac");
      }
      const shopifyShopDomain: string | undefined = request.header(
        "X-Shopify-Shop-Domain"
      );
      if (!shopifyShopDomain) {
        throw new Error(
          "VerifyWebhooksHmac.handle: headers have no shopify domain"
        );
      }
      if (
        hmac !==
        createHmac("sha256", Env.get("API_SECRET"))
          .update(rawBody)
          .digest("base64")
      ) {
        throw new Error("VerifyWebhooksHmac.handle: hmac is wrong");
      }
      request.updateBody({
        ...request.body(),
        shopifyShopDomain: shopifyShopDomain,
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
