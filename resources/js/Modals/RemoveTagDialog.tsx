import { Heading, Modal, TextContainer } from "@shopify/polaris";
import React, { useCallback, useContext, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import {
  deleteTagFromProduct,
  getAllShopProductTags,
  getProduct,
  getTagProducts,
} from "../Helpers/actions";

const RemoveTagDialog = ({
  tag,
  products,
  active,
  toggleActive,
  toggleTagModalActive,
}: {
  tag: string;
  products: { id: string; title: string; tags: string }[];
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTagModalActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const { setProductsTags } = useContext(ProductsContext);
  const handleClick = useCallback(() => {
    toggleActive(!active);
  }, [active]);
  const [removingTags, setRemovingTags] = useState(false);
  return (
    <Modal
      title={`Remove ${tag}`}
      open={active}
      onClose={handleClick}
      primaryAction={{
        loading: removingTags,
        content: "Remove",
        onAction: () => {
          setRemovingTags(true);
          const allPromisedRemoves = Promise.allSettled(
            products.map(async (product) => {
              await deleteTagFromProduct(
                redirectUri,
                appCredentials.app,
                product.tags,
                product.id,
                tag
              );
            })
          );
          allPromisedRemoves.then(() => {
            getAllShopProductTags(redirectUri, appCredentials.app).then(
              (res) => {
                setProductsTags(res.data);
                setRemovingTags(false);
                toggleActive(false);
                toggleTagModalActive(false);
              }
            );
          });
        },
        destructive: true,
      }}
      secondaryActions={[
        { content: "Cancel", onAction: () => toggleActive(false) },
      ]}
    >
      <Modal.Section>
        <Heading>Are you sure?</Heading>
        <TextContainer>
          <p>
            This action will remove the tag "{tag}" from all products that are
            currently associated with it. Click "Remove" if you want to proceed,
            or "Cancel" if you would rather not do that now.
          </p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
};

export default RemoveTagDialog;
