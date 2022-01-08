import Redis from "@ioc:Adonis/Addons/Redis";
import Shop from "App/Models/Shop";
import { getDatabaseShop } from "./DatabaseHelpers";
import { getScopes } from "./ShopifyHelpers";

interface Cache {
  scopes: string;
  state: string;
}

async function delCache(shopShopifyDomain: string): Promise<number> {
  try {
    const cache = await getCache(shopShopifyDomain);
    let deleted: number = 0;
    if (cache) {
      deleted = await Redis.connection("syntogether").del(shopShopifyDomain);
    }
    return deleted;
  } catch (err) {
    console.info(err);
    throw err;
  }
}

async function getCache(shopShopifyDomain: string): Promise<Cache> {
  try {
    if (!shopShopifyDomain) {
      throw new Error("Cache.getCache: missing necessary parameters");
    }
    // todo: shop getter
    const shop: Shop | null = await getDatabaseShop(shopShopifyDomain);
    const cacheString: string | null = await Redis.get(`${shopShopifyDomain}`);
    if (!cacheString) {
      await setCache(shopShopifyDomain, {
        scopes: "",
        state: "",
      });
      return {
        scopes: "",
        state: "",
      };
    }
    const cache: Cache = JSON.parse(cacheString);
    if (!cache) {
      throw new Error("Cache.getCache: JSON parse failed");
    }
    if (!shop) {
      return cache;
    }
    if (cache.scopes === "") {
      // todo: access token redundant for this one, use the shop getter
      const scopes: string = await getScopes(
        shop.shopifyDomain,
        shop.accessToken
      );
      await setCache(shopShopifyDomain, {
        ...cache,
        scopes: scopes,
      });
    }
    return cache;
  } catch (err) {
    console.info(err);
    throw err;
  }
}

async function setCache(
  shopShopifyDomain: string,
  cache: Cache
): Promise<void> {
  try {
    if (!shopShopifyDomain || !cache) {
      throw new Error("Cache.setCache: missing necessary parameters");
    }
    const cacheString: string = JSON.stringify(cache);
    if (!cacheString) {
      throw new Error("Cache.setCache: JSON stringify failed");
    }
    await Redis.set(`${shopShopifyDomain}`, cacheString);
  } catch (err) {
    console.info(err);
    throw err;
  }
}

export { delCache, getCache, setCache, Cache };
