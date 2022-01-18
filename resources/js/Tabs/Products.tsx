import {
  Badge,
  Button,
  Caption,
  Card,
  ChoiceList,
  EmptyState,
  Filters,
  Layout,
  Pagination,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import { ProductsMajor } from "@shopify/polaris-icons";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import { getProducts } from "../Helpers/actions";
import { disambiguateLabel, isEmpty } from "../Helpers/functions";
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
    productsCount,
    setProducts,
    setProductsLoading,
    setNextPage,
    setPrevPage,
    setPageNumber,
  } = useContext(ProductsContext);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAddModalActive, setBulkAddModalActive] = useState(false);

  const [productType, setProductType] = useState(null);
  const [status, setStatus] = useState(null);
  const [queryValue, setQueryValue] = useState(null);
  const handleProductTypeChange = useCallback(
    (value) => setProductType(value),
    []
  );
  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handleFiltersQueryChange = useCallback(
    (value) => setQueryValue(value),
    []
  );
  const handleProductTypeRemove = useCallback(() => setProductType(null), []);
  const handleStatusRemove = useCallback(() => setStatus(null), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleFiltersClearAll = useCallback(() => {
    handleProductTypeRemove();
    handleStatusRemove();
    handleQueryValueRemove();
  }, [handleProductTypeRemove, handleStatusRemove, handleQueryValueRemove]);

  const promotedBulkActions = [
    {
      content: "Bulk add tags",
      onAction: () => {
        setBulkAddModalActive(true);
        console.log({ selectedItems, selectedProducts });
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
    <Pagination
      hasNext={!!nextPage && !productsLoading}
      hasPrevious={!!prevPage && !productsLoading}
      label={`Page ${pageNumber}`}
      onNext={() => getProductPage(nextPage, +1)}
      onPrevious={() => getProductPage(prevPage, -1)}
    />
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
          choices={[
            { label: "Decoration", value: "decoration" },
            { label: "Apparel", value: "apparel" },
            { label: "Accessories", value: "accessories" },
          ]}
          selected={productType || []}
          onChange={handleProductTypeChange}
          allowMultiple
        />
      ),
      shortcut: true,
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

  return (
    <Card.Subsection>
      {paginationMarkup}
      <Filters
        filters={filters}
        queryValue={queryValue}
        appliedFilters={appliedFilters}
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={handleQueryValueRemove}
        onClearAll={handleFiltersClearAll}
      />
      <Button primary onClick={() => refreshProducts()}>
        Refresh products
      </Button>
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
        totalItemsCount={productsCount}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={promotedBulkActions}
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
              onClick={() => setSelectedItems([...selectedItems, id])}
            >
              <Stack alignment="center">
                <h3>
                  <TextStyle variation="strong">{title}</TextStyle>
                </h3>
                {product_type && <Badge status="info">{product_type}</Badge>}
              </Stack>
              {body_html && <p>{body_html}</p>}
              <Caption>
                Created at: {new Date(created_at).toLocaleDateString()}
              </Caption>
              <ProductModal product={product} />
            </ResourceItem>
          );
        }}
      />
      {paginationMarkup}
      <BulkAddTagModal
        selectedProducts={selectedProducts}
        active={bulkAddModalActive}
        toggleActive={setBulkAddModalActive}
      />
    </Card.Subsection>
  );
};

export default Products;