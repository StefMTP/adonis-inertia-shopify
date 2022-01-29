import { Badge, Heading, List, Modal, TextContainer } from "@shopify/polaris";
import React, { useState, useCallback, useContext } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { getTagProducts } from "../Helpers/actions";

const TagModal = ({
  tag,
  active,
  toggleActive,
}: {
  tag: string;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const [tagProducts, setTagProducts] = useState([]);
  const handleClick = useCallback(() => {
    setTagProducts([]);
    toggleActive(!active);
  }, [active]);

  return (
    <Modal
      open={active}
      onTransitionEnd={() => {
        getTagProducts(redirectUri, appCredentials.app, tag).then((res) =>
          setTagProducts(res.data.productNames)
        );
      }}
      onClose={handleClick}
      title={tag}
    >
      <Modal.Section>
        <Heading>Products that have this tag:</Heading>
        <List type="number">
          {tagProducts.length > 0 &&
            tagProducts.map((product) => (
              <List.Item key={`${product}-{tag}`}>{product}</List.Item>
            ))}
        </List>
      </Modal.Section>
    </Modal>
  );
};

export default TagModal;
