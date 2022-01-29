import axios from "axios";
import { ClientApplication } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { product } from "./../../../app/Helpers/ShopifyTypes";

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
  pageQuery?: string,
  queryFilters?: { key: string; value: string }[]
) => {
  const sessionToken = await getSessionToken(app);
  let link = `${redirectUri}/shop/products?page_limit=${pageLimit}`;
  if (pageQuery) {
    link += "&page_query=" + pageQuery;
  }
  if (queryFilters && queryFilters.length > 0) {
    for (const filter of queryFilters) {
      link += `&${filter.key}=${filter.value}`;
    }
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

export const getProductsCount = async (
  redirectUri: string,
  app: ClientApplication<any>,
  queryFilters?: { key: string; value: string }[]
) => {
  const sessionToken = await getSessionToken(app);
  let link = `${redirectUri}/shop/products/count`;
  if (queryFilters && queryFilters.length > 0) {
    link += "?";
    for (const filter of queryFilters) {
      link += `${filter.key}=${filter.value}&`;
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

export const getTotalVariantsCount = async (
  redirectUri: string,
  app: ClientApplication<any>
) => {
  const sessionToken = await getSessionToken(app);
  const res = await axios.get(`${redirectUri}/shop/products/totalVariants`, {
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
): Promise<any> => {
  const sessionToken = await getSessionToken(app);
  if (product.tags.includes(tagInput)) {
    const res = { message: "Tag already exists on product" };
    return res;
  }
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

export const getTagProducts = async (
  redirectUri: string,
  app: ClientApplication<any>,
  tag: string
) => {
  const sessionToken = await getSessionToken(app);
  const res = await axios.get(
    `${redirectUri}/shop/products/tagProducts?tag=${tag}`,
    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return res;
};

export const getAllShopProductTags = async (
  redirectUri: string,
  app: ClientApplication<any>
) => {
  const sessionToken = await getSessionToken(app);
  const res = await axios.get(`${redirectUri}/shop/products/tags`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  return res;
};

export const getAllShopProductTypes = async (
  redirectUri: string,
  app: ClientApplication<any>
) => {
  const sessionToken = await getSessionToken(app);
  const res = await axios.get(`${redirectUri}/shop/productTypes`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  return res;
};
