import { Redirect } from "@shopify/app-bridge/actions";
import {
  Heading,
  Modal,
  ResourceItem,
  ResourceList,
  TextStyle,
} from "@shopify/polaris";
import React, { useState, useCallback, useContext } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { getTagProducts } from "../Helpers/actions";
import RemoveTagDialog from "./RemoveTagDialog";

const TagModal = ({
  tag,
  active,
  toggleActive,
}: {
  tag: string;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { shop, redirectUri, appCredentials } = useContext(
    AppCredentialsContext
  );
  const [tagProducts, setTagProducts] = useState<
    { id: string; title: string; tags: string }[]
  >([]);
  const handleClick = useCallback(() => {
    setTagProducts([]);
    toggleActive(!active);
  }, [active]);

  const [removeTagDialogActive, setRemoveTagDialogActive] = useState(false);

  return (
    <>
      <Modal
        open={active}
        onTransitionEnd={() => {
          getTagProducts(redirectUri, appCredentials.app, tag).then((res) =>
            setTagProducts(res.data.products)
          );
        }}
        onClose={handleClick}
        title={tag}
        primaryAction={{
          content: "Remove tag",
          onAction: () => setRemoveTagDialogActive(true),
        }}
      >
        <Modal.Section>
          <Heading>Products that have this tag:</Heading>
          <ResourceList
            items={tagProducts}
            resourceName={{ singular: "product", plural: "products" }}
            renderItem={(product) => {
              return (
                <ResourceItem
                  id={product.id}
                  onClick={() => {
                    Redirect.create(appCredentials.app).dispatch(
                      Redirect.Action.REMOTE,
                      `https://${shop}/admin/products/${product.id}`
                    );
                  }}
                >
                  <h3>
                    <TextStyle variation="strong">{product.title}</TextStyle>
                  </h3>
                </ResourceItem>
              );
            }}
            loading={!tagProducts.length}
          />
        </Modal.Section>
      </Modal>
      <RemoveTagDialog
        tag={tag}
        products={tagProducts}
        active={removeTagDialogActive}
        toggleActive={setRemoveTagDialogActive}
      />
    </>
  );
};

export default TagModal;
