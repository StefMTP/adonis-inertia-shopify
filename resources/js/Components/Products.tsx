import {
  Avatar,
  Badge,
  Caption,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import { ProductsMajor } from "@shopify/polaris-icons";
import { useContext } from "react";
import { ProductsContext } from "../Contexts/ProductsContext";

const Products = () => {
  const { products, productsLoading } = useContext(ProductsContext);
  // if (!products || products.length <= 0) return <p>Loading products...</p>;
  return (
    <ResourceList
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
            <Stack>
              <h3>
                <TextStyle variation="strong">{title}</TextStyle>
              </h3>
              {product_type && <Badge status="info">{product_type}</Badge>}
            </Stack>
            {body_html && <p>{body_html}</p>}
            <Caption>
              Created at: {new Date(created_at).toLocaleDateString()}
            </Caption>
          </ResourceItem>
        );
      }}
    />
  );
};

export default Products;
