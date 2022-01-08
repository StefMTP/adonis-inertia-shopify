import Shop from "App/Models/Shop";

export const getDatabaseShop = async (
  shopifyDomain: string
): Promise<Shop | null> => {
  try {
    return await Shop.findBy("shopifyDomain", shopifyDomain);
  } catch (err) {
    console.log("no shop found for " + shopifyDomain);
    throw err;
  }
};
