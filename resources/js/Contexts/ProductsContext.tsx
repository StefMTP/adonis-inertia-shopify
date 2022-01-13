import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts } from "../Helpers/actions";
import { AppCredentialsContext } from "./AppCredentialsContext";

type ProductsContextProviderProps = {
  children: React.ReactNode;
  redirectUri: string;
};

export type variant = {
  id: number;
  sku: string;
  grams: number;
  price: number;
  title: string;
  weight: number;
  barcode: string;
  option1: string;
  taxable: boolean;
  position: number;
  created_at: Date;
  product_id: number;
  updated_at: Date;
  weight_unit: string;
  compare_at_price: any;
  inventory_policy: any;
  inventory_item_id: number;
  requires_shipping: boolean;
  inventory_quantity: number;
  fulfillment_service: any;
  inventory_management: any;
};

export type option = {
  id: number;
  name: string;
  values: string[];
  position: number;
  product_id: number;
};

export type image = {
  id: number;
  src: string;
  width: number;
  height: number;
  position: number;
  created_at: Date;
  product_id: number;
  updated_at: Date;
  variant_ids: {}[];
};

export type product = {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: Date;
  published_at: Date;
  template_suffix: any;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: variant[];
  options: option[];
  images: image[];
  image: any;
};

type ProductsContextType = {
  products: product[];
  productsLoading: boolean;
  setProducts: React.Dispatch<React.SetStateAction<product[]>>;
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const productsDefaultValue: ProductsContextType = {
  products: [],
  productsLoading: false,
  setProducts: () => {},
  setProductsLoading: () => {},
};

export const ProductsContext = createContext(productsDefaultValue);

const ProductsProvider = ({
  children,
  redirectUri,
}: ProductsContextProviderProps) => {
  const [products, setProducts] = useState(productsDefaultValue.products);
  const [productsLoading, setProductsLoading] = useState(
    productsDefaultValue.productsLoading
  );

  const { appCredentials } = useContext(AppCredentialsContext);
  const appBridgeClient = appCredentials.app;

  useEffect(() => {
    if (appBridgeClient) {
      setProductsLoading(true);
      getProducts(redirectUri, appBridgeClient).then((res) => {
        setProducts(res.data.products);
        setProductsLoading(false);
      });
    }
  }, [appBridgeClient]);

  return (
    <ProductsContext.Provider
      value={{ products, setProducts, productsLoading, setProductsLoading }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
