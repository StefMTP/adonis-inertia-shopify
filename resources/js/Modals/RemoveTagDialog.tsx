import { Heading, Modal, TextContainer } from "@shopify/polaris";
import React, { useCallback, useContext } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { deleteTagFromProduct, getProduct } from "../Helpers/actions";

const RemoveTagDialog = ({
  tag,
  products,
  active,
  toggleActive,
}: {
  tag: string;
  products: { id: string; title: string; tags: string }[];
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const handleClick = useCallback(() => {
    toggleActive(!active);
  }, [active]);
  return (
    <Modal
      title={`Remove ${tag}`}
      open={active}
      onClose={handleClick}
      primaryAction={{
        content: "Remove",
        onAction: () => {
          for (const product of products) {
            deleteTagFromProduct(
              redirectUri,
              appCredentials.app,
              product.tags,
              product.id,
              tag
            ).then((res) => console.log(res));
          }
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
