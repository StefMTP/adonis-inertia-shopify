import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getProducts,
  getProductsCount,
  getCollections,
  getAllShopProductTypes,
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
  currentPage: any;
  nextPage: any;
  pageNumber: number;
  productsCount: number;
  totalProductsCount: number;
  totalVariantsCount: number;
  productsOptions: { [name: string]: string[] };
  productsTags: [];
  productTypes: string[];
  collections: { id: string; title: string }[];
  setProducts: React.Dispatch<React.SetStateAction<product[]>>;
  setProductsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevPage: React.Dispatch<React.SetStateAction<any>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<any>>;
  setNextPage: React.Dispatch<React.SetStateAction<any>>;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setProductsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalProductsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalVariantsCount: React.Dispatch<React.SetStateAction<number>>;
  setProductsOptions: React.Dispatch<React.SetStateAction<{}>>;
  setProductsTags: React.Dispatch<React.SetStateAction<[]>>;
  setProductTypes: React.Dispatch<React.SetStateAction<[]>>;
  setCollections: React.Dispatch<
    React.SetStateAction<{ id: string; title: string }[]>
  >;
};

const productsDefaultValue: ProductsContextType = {
  products: [],
  productsLoading: false,
  prevPage: "",
  currentPage: "",
  nextPage: "",
  pageNumber: 1,
  productsCount: 0,
  totalProductsCount: 0,
  totalVariantsCount: 0,
  productsOptions: {},
  productsTags: [],
  productTypes: [],
  collections: [],
  setProducts: () => {},
  setProductsLoading: () => {},
  setPrevPage: () => {},
  setCurrentPage: () => {},
  setNextPage: () => {},
  setPageNumber: () => {},
  setProductsCount: () => {},
  setTotalProductsCount: () => {},
  setTotalVariantsCount: () => {},
  setProductsTags: () => {},
  setProductTypes: () => {},
  setCollections: () => {},
  setProductsOptions: () => {},
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
  const [currentPage, setCurrentPage] = useState(
    productsDefaultValue.currentPage
  );
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
  const [productsOptions, setProductsOptions] = useState(
    productsDefaultValue.productsOptions
  );
  const [productsTags, setProductsTags] = useState(
    productsDefaultValue.productsTags
  );
  const [productTypes, setProductTypes] = useState(
    productsDefaultValue.productTypes
  );
  const [collections, setCollections] = useState(
    productsDefaultValue.collections
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
      getCollections(redirectUri, appBridgeClient).then((res) => {
        setCollections(
          res.data.body.data.collections.edges.map((edge) => {
            return { id: edge.node.id, title: edge.node.title };
          })
        );
      });
      getAllShopProductTypes(redirectUri, appBridgeClient).then((res) => {
        setProductTypes(res.data);
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
        currentPage,
        prevPage,
        pageNumber,
        productsCount,
        totalProductsCount,
        totalVariantsCount,
        productsOptions,
        productsTags,
        productTypes,
        collections,
        setProducts,
        setProductsLoading,
        setNextPage,
        setCurrentPage,
        setPrevPage,
        setPageNumber,
        setProductsCount,
        setTotalProductsCount,
        setTotalVariantsCount,
        setProductsOptions,
        setProductsTags,
        setProductTypes,
        setCollections,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsProvider;
