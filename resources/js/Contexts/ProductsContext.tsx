import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllShopProductTags,
  getAllShopProductTypes,
  getProducts,
  getProductsCount,
} from "../Helpers/actions";
import { product } from "./../../../app/Helpers/ShopifyTypes";
import { AppCredentialsContext } from "./AppCredentialsContext";
import { SettingsContext } from "./SettingsContext";

type ProductsContextProviderProps = {
  children: React.ReactNode;
  redirectUri: string;
};

type ProductsContextType = {
  products: product[];
  productsLoading: boolean;
  prevPage: any;
  nextPage: any;
  pageNumber: number;
  productsCount: number;
  totalProductsCount: number;
  totalVariantsCount: number;
  productsTags: [];
  productTypes: [];
  setProducts: React.Dispatch<React.SetStateAction<product[]>>;
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevPage: React.Dispatch<React.SetStateAction<any>>;
  setNextPage: React.Dispatch<React.SetStateAction<any>>;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setProductsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalProductsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalVariantsCount: React.Dispatch<React.SetStateAction<number>>;
  setProductsTags: React.Dispatch<React.SetStateAction<[]>>;
  setProductTypes: React.Dispatch<React.SetStateAction<[]>>;
};

const productsDefaultValue: ProductsContextType = {
  products: [],
  productsLoading: false,
  prevPage: "",
  nextPage: "",
  pageNumber: 1,
  productsCount: 0,
  totalProductsCount: 0,
  totalVariantsCount: 0,
  productsTags: [],
  productTypes: [],
  setProducts: () => {},
  setProductsLoading: () => {},
  setPrevPage: () => {},
  setNextPage: () => {},
  setPageNumber: () => {},
  setProductsCount: () => {},
  setTotalProductsCount: () => {},
  setTotalVariantsCount: () => {},
  setProductsTags: () => {},
  setProductTypes: () => {},
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
  const [totalProductsCount, setTotalProductsCount] = useState(
    productsDefaultValue.totalProductsCount
  );
  const [totalVariantsCount, setTotalVariantsCount] = useState(
    productsDefaultValue.totalVariantsCount
  );
  const [productsTags, setProductsTags] = useState(
    productsDefaultValue.productsTags
  );
  const [productTypes, setProductTypes] = useState(
    productsDefaultValue.productTypes
  );

  const { appCredentials } = useContext(AppCredentialsContext);
  const appBridgeClient = appCredentials.app;
  const { pageLimit } = useContext(SettingsContext);

  useEffect(() => {
    if (appBridgeClient) {
      setProductsLoading(true);
      getProductsCount(redirectUri, appBridgeClient).then((res) => {
        setProductsCount(res.data.body.count);
        setTotalProductsCount(res.data.body.count);
      });
      getAllShopProductTags(redirectUri, appBridgeClient).then((res) => {
        setProductsTags(
          res.data.body.data.shop.productTags.edges.map((edge) => edge.node)
        );
      });
      getAllShopProductTypes(redirectUri, appBridgeClient).then((res) => {
        setProductTypes(
          res.data.body.data.shop.productTypes.edges.map((edge) => edge.node)
        );
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
        totalProductsCount,
        totalVariantsCount,
        productsTags,
        productTypes,
        setProducts,
        setProductsLoading,
        setNextPage,
        setPrevPage,
        setPageNumber,
        setProductsCount,
        setTotalProductsCount,
        setTotalVariantsCount,
        setProductsTags,
        setProductTypes,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
