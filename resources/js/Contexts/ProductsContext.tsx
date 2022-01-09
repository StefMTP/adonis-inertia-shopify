import { ClientApplication, createApp } from "@shopify/app-bridge";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../Helpers/actions";
import { AppCredentialsContext } from "./AppCredentialsContext";

type ProductsContextProviderProps = {
  children: React.ReactNode;
  redirectUri: string;
};

export type product = {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: Date;
  handle: string;
  updated_at: Date;
  published_at: Date;
  template_suffix: string;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: [];
  options: [];
  images: [];
  image: string;
};

type ProductsContextType = {
  products: product[];
  setProducts: React.Dispatch<React.SetStateAction<product[]>>;
};

const productsDefaultValue: ProductsContextType = {
  products: [],
  setProducts: () => {},
};

export const ProductsContext = createContext(productsDefaultValue);

const ProductsProvider = ({
  children,
  redirectUri,
}: ProductsContextProviderProps) => {
  const [products, setProducts] = useState(productsDefaultValue.products);

  const { appCredentials } = useContext(AppCredentialsContext);
  const appBridgeClient = appCredentials.app;

  useEffect(() => {
    console.log("here.", appBridgeClient);
    if (appBridgeClient) {
      getProducts(redirectUri, appBridgeClient).then((res) => {
        setProducts(res.data.products);
      });
    }
  }, [appBridgeClient]);

  return (
    <ProductsContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
