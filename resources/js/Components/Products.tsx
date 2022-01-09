import {
  Badge,
  Caption,
  List,
  ResourceItem,
  ResourceList,
  Stack,
  TextStyle,
} from "@shopify/polaris";
import { useContext } from "react";
import { ProductsContext } from "../Contexts/ProductsContext";

const Products = () => {
  const { products } = useContext(ProductsContext);
  if (!products) return <p>Loading products...</p>;
  return (
    <ResourceList
      resourceName={{ singular: "product", plural: "products" }}
      items={products}
      renderItem={(product) => {
        const { id, title, image, body_html, product_type, created_at } =
          product;

        return (
          <ResourceItem id={`${id}`} media={image} onClick={() => {}}>
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
    // <List>
    //   {products.map((product) => (
    //     <List.Item key={product.id}>{product.title}</List.Item>
    //   ))}
    // </List>
  );
};

export default Products;
