import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class VerifyRegEx {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const requestQuery: any = request.qs();
      if (!requestQuery.shop) {
        throw new Error("VerifyRegEx.handle: query has no shop");
      }
      if (
        !/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(requestQuery.shop)
      ) {
        throw new Error(
          "VerifyRegEx.handle: something went wrong with regex verification"
        );
      }
      request.updateBody({
        ...request.body(),
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
