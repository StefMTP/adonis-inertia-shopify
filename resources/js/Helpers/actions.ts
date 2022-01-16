import axios from "axios";
import { ClientApplication } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { product } from "../Contexts/ProductsContext";

export const getAppCredentials = async (redirectUri: string, shop: string) => {
  const res = await axios.get(`${redirectUri}/credentials?shop=${shop}`);
  return res;
};

export const getDefaultSettings = async (redirectUri: string) => {
  const res = await axios.get(`${redirectUri}/settings`);
  return res;
};

export const getProducts = async (
  redirectUri: string,
  app: ClientApplication<any>,
  pageLimit: number,
  pageQuery?: string
  // appliedFilters?: { key: string; value: string }[]
) => {
  const sessionToken = await getSessionToken(app);
  let link = `${redirectUri}/shop/products?page_limit=${pageLimit}`;
  if (pageQuery) {
    link += "&page_query=" + pageQuery;
  }
  // if (appliedFilters && appliedFilters.length > 0) {
  //   link += "?";
  //   for (const filter of appliedFilters) {
  //     link += `${filter.key}=${filter.value}`;
  //   }
  //   link = link.slice(0, -1);
  // }
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

export const addTagToProduct = async (
  redirectUri: string,
  app: ClientApplication<any>,
  product: product,
  tagInput: string
) => {
  const sessionToken = await getSessionToken(app);
  const res = await axios.post(
    `${redirectUri}/shop/products/editTag`,
    {
      id: product.id,
      tags: `${product.tags},${tagInput}`,
    },
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return res;
};

export const deleteTagFromProduct = async (
  redirectUri: string,
  app: ClientApplication<any>,
  product: product,
  tagToDelete: string
) => {
  const sessionToken = await getSessionToken(app);
  const tagsRemaining = product.tags
    .split(", ")
    .filter((tag) => tag !== tagToDelete);
  const res = await axios.post(
    `${redirectUri}/shop/products/editTag`,
    {
      id: product.id,
      tags: tagsRemaining,
    },
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return res;
};
