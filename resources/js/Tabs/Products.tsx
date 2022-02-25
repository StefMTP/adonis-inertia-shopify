import {
  Badge,
  Button,
  Caption,
  Card,
  ChoiceList,
  EmptyState,
  Filters,
  Pagination,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import { ProductsMajor, RefreshMajor } from "@shopify/polaris-icons";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import { getProducts, getProductsCount } from "../Helpers/actions";
import { disambiguateLabel, isEmpty } from "../Helpers/functions";
import { product } from "./../../../app/Helpers/ShopifyTypes";
import BulkAddTagModal from "../Modals/BulkAddTagModal";
import ProductModal from "../Modals/ProductModal";

const Products = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const { pageLimit } = useContext(SettingsContext);
  const {
    products,
    productsLoading,
    nextPage,
    prevPage,
    pageNumber,
    productTypes,
    productsCount,
    collections,
    setProducts,
    setProductsLoading,
    setNextPage,
    setCurrentPage,
    setPrevPage,
    setPageNumber,
    setProductsCount,
  } = useContext(ProductsContext);

  const [modalProduct, setModalProduct] = useState<product>({} as product);
  const [productModalActive, setProductModalActive] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAddModalActive, setBulkAddModalActive] = useState(false);

  const [productType, setProductType] = useState(null);
  const [status, setStatus] = useState(null);
  const [collection, setCollection] = useState(null);
  const [queryValue, setQueryValue] = useState(null);
  const handleProductTypeChange = useCallback(
    (value) => setProductType(value),
    []
  );
  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handleCollectionChange = useCallback(
    (value) => setCollection(value),
    []
  );
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    []
  );
  const handleProductTypeRemove = useCallback(() => setProductType(null), []);
  const handleStatusRemove = useCallback(() => setStatus(null), []);
  const handleCollectionRemove = useCallback(() => setCollection(null), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleFiltersClearAll = useCallback(() => {
    handleProductTypeRemove();
    handleStatusRemove();
    handleCollectionRemove();
    handleQueryValueRemove();
  }, [
    handleProductTypeRemove,
    handleStatusRemove,
    handleCollectionRemove,
    handleQueryValueRemove,
  ]);

  const promotedBulkActions = [
    {
      content: "Bulk add tags",
      onAction: () => {
        setBulkAddModalActive(true);
      },
    },
  ];
  const handleSelectionChange = useCallback(
    (value) => setSelectedItems(value),
    [selectedItems]
  );

  useEffect(() => {
    setSelectedProducts(
      products.filter((product) => selectedItems.includes(+product.id))
    );
  }, [selectedItems]);

  const refreshProducts = () => {
    setProductsLoading(true);
    const queryFilters = [];
    if (!isEmpty(productType)) {
      queryFilters.push({ key: "productType", value: productType });
    }
    if (!isEmpty(status)) {
      queryFilters.push({ key: "status", value: status });
    }
    getProductsCount(redirectUri, appCredentials.app, queryFilters).then(
      (res) => {
        setProductsCount(res.data.body.count);
      }
    );
    getProducts(
      redirectUri,
      appCredentials.app,
      pageLimit,
      undefined,
      queryFilters
    ).then((res) => {
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
      setPageNumber(1);
      setProductsLoading(false);
    });
  };

  const getProductPage = (page: any, increment: number) => {
    setProductsLoading(true);
    setCurrentPage(page);
    getProducts(
      redirectUri,
      appCredentials.app,
      pageLimit,
      JSON.stringify(page)
    ).then((res) => {
      setProducts(res.data.body.products);
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
      setPageNumber((currentNumber) => currentNumber + increment);
      setProductsLoading(false);
    });
  };

  const paginationMarkup = (
    <Stack alignment="center">
      <Pagination
        hasNext={!!nextPage && !productsLoading}
        hasPrevious={!!prevPage && !productsLoading}
        label={`Page ${pageNumber}`}
        onNext={() => getProductPage(nextPage, +1)}
        onPrevious={() => getProductPage(prevPage, -1)}
      />
      {!productsLoading && (
        <TextStyle variation="subdued">{`${
          products.length ? (pageNumber - 1) * pageLimit + 1 : 0
        } to ${
          products.length + (pageNumber - 1) * pageLimit
        } products`}</TextStyle>
      )}
    </Stack>
  );

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ]}
          selected={status || []}
          onChange={handleStatusChange}
        />
      ),
      shortcut: true,
    },
    {
      key: "productType",
      label: "Product Type",
      filter: (
        <ChoiceList
          title="Product type"
          titleHidden
          choices={productTypes.map((type) => {
            return { label: type, value: type };
          })}
          selected={productType || []}
          onChange={handleProductTypeChange}
        />
      ),
      shortcut: true,
    },
    {
      key: "collection",
      label: "Collection",
      filter: (
        <ChoiceList
          title="Collection"
          titleHidden
          choices={collections.map((collection) => {
            return { label: collection.title, value: collection.title };
          })}
          selected={collection || []}
          onChange={handleCollectionChange}
        />
      ),
    },
  ];

  const appliedFilters = [];
  if (!isEmpty(productType)) {
    const key = "productType";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, productType),
      onRemove: handleProductTypeRemove,
    });
  }
  if (!isEmpty(status)) {
    const key = "status";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, status),
      onRemove: handleStatusRemove,
    });
  }
  if (!isEmpty(collection)) {
    const key = "collection";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, collection),
      onRemove: handleCollectionRemove,
    });
  }

  return (
    <Card.Subsection>
      <div style={{ marginBottom: "10px" }}>
        <Stack distribution="equalSpacing">
          {paginationMarkup}
          <Button icon={RefreshMajor} primary onClick={() => refreshProducts()}>
            Refresh products
          </Button>
        </Stack>
      </div>
      <Filters
        filters={filters}
        queryValue={queryValue}
        appliedFilters={appliedFilters}
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={handleQueryValueRemove}
        onClearAll={handleFiltersClearAll}
      />
      <ResourceList
        emptyState={
          !products.length && (
            <EmptyState
              heading="Create a product to get started"
              action={{ content: "Create products" }}
              image="https://tofarmakomou.gr/images/noitemstoshow.jpg"
            >
              <p>
                The lifeblood of your shop is your products. Get your inventory
                stocked to get started!
              </p>
            </EmptyState>
          )
        }
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={promotedBulkActions}
        totalItemsCount={productsCount}
        loading={productsLoading}
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(product) => {
          const { id, title, image, body_html, product_type, created_at } =
            product;
          const media = (
            <Thumbnail
              source={image ? image.src : ProductsMajor}
              alt={title}
              size="medium"
            />
          );
          return (
            <ResourceItem
              id={id}
              media={media}
              onClick={() => {} /* setSelectedItems([...selectedItems, id]) */}
            >
              <Stack alignment="center">
                <h3>
                  <TextStyle variation="strong">{title}</TextStyle>
                </h3>
                <Badge status={product_type ? "info" : "attention"}>
                  {product_type || "No product type"}
                </Badge>
              </Stack>
              <Caption>
                Created at: {new Date(created_at).toLocaleDateString()}
              </Caption>
              <Button
                size="slim"
                onClick={() => {
                  setModalProduct(product);
                  setProductModalActive(true);
                }}
              >
                Edit product
              </Button>
            </ResourceItem>
          );
        }}
      />
      {paginationMarkup}
      <ProductModal
        product={modalProduct}
        active={productModalActive}
        toggleActive={setProductModalActive}
        pageRefresher={getProductPage}
      />
      <BulkAddTagModal
        selectedProducts={selectedProducts}
        active={bulkAddModalActive}
        toggleActive={setBulkAddModalActive}
      />
    </Card.Subsection>
  );
};

export default Products;
