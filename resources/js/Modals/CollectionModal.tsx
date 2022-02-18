import React, { useCallback, useContext, useState } from "react";
import {
  Heading,
  List,
  Modal,
  ResourceItem,
  ResourceList,
  TextStyle,
} from "@shopify/polaris";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { getCollectionProducts } from "../Helpers/actions";
import { Redirect } from "@shopify/app-bridge/actions";
import { getIdfromGid } from "../Helpers/functions";

const CollectionModal = ({
  collectionId,
  collectionTitle,
  active,
  toggleActive,
}: {
  collectionId: string;
  collectionTitle: string;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { shop, redirectUri, appCredentials } = useContext(
    AppCredentialsContext
  );
  const [collectionProducts, setCollectionProducts] = useState([]);
  const handleClick = useCallback(() => {
    setCollectionProducts([]);
    toggleActive(!active);
  }, [active]);
  return (
    <Modal
      open={active}
      onTransitionEnd={() => {
        getCollectionProducts(
          redirectUri,
          appCredentials.app,
          collectionId
        ).then((res) =>
          setCollectionProducts(
            res.data.body.data.collection.products.edges.map((edge) => {
              return { id: edge.node.id, title: edge.node.title };
            })
          )
        );
      }}
      onClose={handleClick}
      title={collectionTitle}
    >
      <Modal.Section>
        <Heading>Products that belong to this collection:</Heading>
        <ResourceList
          items={collectionProducts}
          renderItem={(product) => {
            const { id, title } = product;
            return (
              <ResourceItem
                id={id}
                onClick={() => {
                  Redirect.create(appCredentials.app).dispatch(
                    Redirect.Action.REMOTE,
                    `https://${shop}/admin/products/${getIdfromGid(id)}`
                  );
                }}
              >
                <h3>
                  <TextStyle variation="strong">{title}</TextStyle>
                </h3>
              </ResourceItem>
            );
          }}
          loading={!collectionProducts.length}
        />
      </Modal.Section>
    </Modal>
  );
};

export default CollectionModal;
