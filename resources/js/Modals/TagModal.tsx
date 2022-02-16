import {
  Badge,
  Heading,
  List,
  Modal,
  ResourceItem,
  ResourceList,
  Spinner,
  Stack,
  TextContainer,
  TextStyle,
} from "@shopify/polaris";
import React, { useState, useCallback, useContext } from "react";
import { product } from "../../../app/Helpers/ShopifyTypes";
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
  const [tagProducts, setTagProducts] = useState<string[]>([]);
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
        <ResourceList
          items={tagProducts}
          resourceName={{ singular: "product", plural: "products" }}
          renderItem={(product) => {
            return (
              <ResourceItem id={product} onClick={() => {}}>
                <h3>
                  <TextStyle variation="strong">{product}</TextStyle>
                </h3>
              </ResourceItem>
            );
          }}
          loading={!tagProducts.length}
        />
      </Modal.Section>
    </Modal>
  );
};

export default TagModal;
