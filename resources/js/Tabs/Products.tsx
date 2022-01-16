import {
  Avatar,
  Badge,
  Caption,
  EmptyState,
  Pagination,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import { ProductsMajor } from "@shopify/polaris-icons";
import { useContext } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { getProducts } from "../Helpers/actions";
import ProductModal from "../Modals/ProductModal";

const Products = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const {
    products,
    productsLoading,
    nextPage,
    prevPage,
    pageNumber,
    setProducts,
    setProductsLoading,
    setNextPage,
    setPrevPage,
    setPageNumber,
  } = useContext(ProductsContext);

  const getProductPage = (page: any, increment: number) => {
    setProductsLoading(true);
    getProducts(redirectUri, appCredentials.app, JSON.stringify(page)).then(
      (res) => {
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
      }
    );
  };

  return (
    <>
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
            <ResourceItem id={`${id}`} media={media} onClick={() => {}}>
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
      <Pagination
        hasNext={!!nextPage && !productsLoading}
        hasPrevious={!!prevPage && !productsLoading}
        label={`Page ${pageNumber}`}
        onNext={() => getProductPage(nextPage, +1)}
        onPrevious={() => getProductPage(prevPage, -1)}
      />
    </>
  );
};

export default Products;
