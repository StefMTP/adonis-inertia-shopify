import axios from "axios";
import { ClientApplication } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";

export const getAppCredentials = async (redirectUri: string, shop: string) => {
  const res = await axios.get(`${redirectUri}/credentials?shop=${shop}`);
  return res;
};

export const getProducts = async (
  redirectUri: string,
  app: ClientApplication<any>,
  appliedFilters?: { key: string; value: string }[]
) => {
  const sessionToken = await getSessionToken(app);
  let link = `${redirectUri}/shop/products`;
  if (appliedFilters && appliedFilters.length > 0) {
    link += "?";
    for (const filter of appliedFilters) {
      link += `${filter.key}=${filter.value}`;
    }
    link = link.slice(0, -1);
  }
  const res = await axios.get(link, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (res.data.redirect) {
    Redirect.create(app).dispatch(Redirect.Action.REMOTE, res.data.redirect);
  }
  return res;
};
