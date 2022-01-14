import {
  Avatar,
  Badge,
  Caption,
  EmptyState,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import { ProductsMajor } from "@shopify/polaris-icons";
import { useContext, useState } from "react";
import { product, ProductsContext } from "../Contexts/ProductsContext";
import ProductModal from "../Modals/ProductModal";

const Products = () => {
  const { products, productsLoading } = useContext(ProductsContext);
  // const [selectedProduct, setSelectedProduct] = useState<product>(
  //   {} as product
  // );

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
    </>
  );
};

export default Products;
