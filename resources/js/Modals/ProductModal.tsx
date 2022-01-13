import { Button, Modal } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { product } from "../Contexts/ProductsContext";

const ProductModal = ({ product }: { product: product }) => {
  const [active, setActive] = useState(false);

  const handleClick = useCallback(() => setActive(!active), [active]);

  const activator = <Button onClick={handleClick}>Edit product tags</Button>;
  return (
    <Modal
      activator={activator}
      open={active}
      onClose={handleClick}
      title={product.title}
    >
      <Modal.Section>
        <img src={product.image?.src} alt={product.title} />
      </Modal.Section>
    </Modal>
  );
};

export default ProductModal;
