import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { createHmac } from "crypto";
import Env from "@ioc:Adonis/Core/Env";

export default class VerifyHmac {
  private createQueryMessage(query: any): string {
    let message: string = "";
    if (!query) {
      return message;
    }
    for (const property in query) {
      if (property === "hmac") {
        continue;
      }
      message += `${property}=${query[property]}&`;
    }
    return message.substring(0, message.length - 1);
  }

  public async handle(
    { response, request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const requestQuery: any = request.qs();
      if (!requestQuery.hmac) {
        throw new Error("VerifyHmac.handle: query has no hmac");
      }
      const message: string = this.createQueryMessage(requestQuery);
      if (
        requestQuery.hmac !==
        createHmac("sha256", Env.get("API_SECRET"))
          .update(message)
          .digest("hex")
      ) {
        throw new Error("VerifyHmac.handle: hmac is wrong");
      }
      request.updateBody({
        ...request.body(),
      });
    } catch (err) {
      console.info(err.message);
      response.status(500).json({
        message: err.message || err,
      });
      return;
    }
    await next();
  }
}
