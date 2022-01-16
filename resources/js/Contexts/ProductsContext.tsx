import React, { createContext, useContext, useEffect, useState } from "react";
import { getProducts, getProductsCount } from "../Helpers/actions";
import { AppCredentialsContext } from "./AppCredentialsContext";
import { SettingsContext } from "./SettingsContext";

type ProductsContextProviderProps = {
  children: React.ReactNode;
  redirectUri: string;
};

export type variant = {
  id: string;
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
  id: string;
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
  prevPage: any;
  nextPage: any;
  pageNumber: number;
  productsCount: number;
  setProducts: React.Dispatch<React.SetStateAction<product[]>>;
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevPage: React.Dispatch<React.SetStateAction<any>>;
  setNextPage: React.Dispatch<React.SetStateAction<any>>;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setProductsCount: React.Dispatch<React.SetStateAction<number>>;
};

const productsDefaultValue: ProductsContextType = {
  products: [],
  productsLoading: false,
  prevPage: "",
  nextPage: "",
  pageNumber: 1,
  productsCount: 0,
  setProducts: () => {},
  setProductsLoading: () => {},
  setPrevPage: () => {},
  setNextPage: () => {},
  setPageNumber: () => {},
  setProductsCount: () => {},
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
  const [nextPage, setNextPage] = useState(productsDefaultValue.nextPage);
  const [prevPage, setPrevPage] = useState(productsDefaultValue.prevPage);
  const [pageNumber, setPageNumber] = useState(productsDefaultValue.pageNumber);
  const [productsCount, setProductsCount] = useState(
    productsDefaultValue.productsCount
  );

  const { appCredentials } = useContext(AppCredentialsContext);
  const appBridgeClient = appCredentials.app;
  const { pageLimit } = useContext(SettingsContext);

  useEffect(() => {
    if (appBridgeClient) {
      setProductsLoading(true);
      getProductsCount(redirectUri, appBridgeClient).then((res) => {
        setProductsCount(res.data.body.count);
      });
      getProducts(redirectUri, appBridgeClient, pageLimit).then((res) => {
        try {
          setPrevPage(res.data.pageInfo.prevPage);
        } catch (e) {
          setPrevPage(false);
        }
        try {
          setNextPage(res.data.pageInfo.nextPage);
        } catch (e) {
          setNextPage(false);
        }
        setProducts(res.data.body.products);
        setProductsLoading(false);
      });
    }
  }, [appBridgeClient]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        productsLoading,
        nextPage,
        prevPage,
        pageNumber,
        productsCount,
        setProducts,
        setProductsLoading,
        setNextPage,
        setPrevPage,
        setPageNumber,
        setProductsCount,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
