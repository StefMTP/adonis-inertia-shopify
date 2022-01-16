import {
  Button,
  Heading,
  Layout,
  List,
  Modal,
  TextField,
  TextStyle,
} from "@shopify/polaris";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { product, ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import { addTagToProduct, getProducts } from "../Helpers/actions";

const BulkAddTagModal = ({
  selectedProducts,
  active,
  toggleActive,
}: {
  selectedProducts: product[];
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { appCredentials, redirectUri } = useContext(AppCredentialsContext);
  const { setProducts } = useContext(ProductsContext);
  const { pageLimit } = useContext(SettingsContext);

  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState(false);
  const [succeededTagEdits, setSucceededTagEdits] = useState(0);
  const handleClick = useCallback(() => toggleActive(!active), [active]);
  const handleChange = useCallback((newValue) => setTagInput(newValue), []);

  useEffect(() => {
    setSucceededTagEdits(0);
  }, [active]);

  return (
    <Modal
      title="Add tag to all selected products"
      open={active}
      onClose={handleClick}
    >
      <Modal.Section>
        <Layout>
          <Layout.Section>
            <Heading>You have selected:</Heading>
          </Layout.Section>
          <Layout.Section>
            <List type="number">
              {selectedProducts.map((product) => (
                <List.Item key={product.id}>{product.title}</List.Item>
              ))}
            </List>
          </Layout.Section>
          <Layout.Section>
            <TextField
              label={"Tag input"}
              labelHidden
              placeholder={"Tag input"}
              value={tagInput}
              onChange={handleChange}
              autoComplete="off"
              connectedRight={
                <Button
                  disabled={tagInput.length === 0}
                  loading={editingTags}
                  onClick={() => {
                    setEditingTags(true);
                    const allPromisedEdits = Promise.allSettled(
                      selectedProducts.map(async (product) => {
                        await addTagToProduct(
                          redirectUri,
                          appCredentials.app,
                          product,
                          tagInput
                        );
                      })
                    );
                    allPromisedEdits.then((results) => {
                      results.forEach((res) => {
                        if (res.status) {
                          setSucceededTagEdits(
                            (prevCounter) => prevCounter + 1
                          );
                        }
                      });
                      getProducts(
                        redirectUri,
                        appCredentials.app,
                        pageLimit
                      ).then((res) => {
                        setProducts(res.data.body.products);
                        setEditingTags(false);
                      });
                    });
                  }}
                >
                  Add tag to all products
                </Button>
              }
            />
          </Layout.Section>
          {!!succeededTagEdits && (
            <Layout.Section>
              <TextStyle variation="positive">
                Tag {tagInput} added to {succeededTagEdits}/
                {selectedProducts.length}
              </TextStyle>
            </Layout.Section>
          )}
        </Layout>
      </Modal.Section>
    </Modal>
  );
};

export default BulkAddTagModal;
