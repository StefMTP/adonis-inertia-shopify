import { List } from "@shopify/polaris";
import { useContext } from "react";
import { ProductsContext } from "../Contexts/ProductsContext";

const Products = () => {
  const { products } = useContext(ProductsContext);
  console.log(products);
  if (!products) return <p>Loading products...</p>;
  return (
    <List>
      {products.map((product) => (
        <List.Item key={product.id}>{product.title}</List.Item>
      ))}
    </List>
  );
};

export default Products;
