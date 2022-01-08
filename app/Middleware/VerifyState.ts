import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Cache, getCache } from "App/Helpers/Cache";

export default class VerifyState {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const requestQuery: any = request.qs();
      if (!requestQuery.state || !requestQuery.shop) {
        throw new Error("VerifyState.handle: query has no state or shop");
      }
      const cache: Cache = await getCache(requestQuery.shop);
      if (requestQuery.state !== cache.state) {
        throw new Error("VerifyState.handle: state is wrong");
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
