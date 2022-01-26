import {
  Button,
  Layout,
  Modal,
  Stack,
  Tag,
  TextField,
  TextStyle,
  Toast,
} from "@shopify/polaris";
import React, { useCallback, useContext, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { product, ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import {
  addTagToProduct,
  deleteTagFromProduct,
  getProducts,
} from "../Helpers/actions";

const ProductModal = ({ product }: { product: product }) => {
  const [active, setActive] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editingTagInProgress, setEditingTagInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [isToastActive, setIsToastActive] = useState(false);

  const { appCredentials, redirectUri } = useContext(AppCredentialsContext);
  const { pageLimit } = useContext(SettingsContext);
  const { setProducts } = useContext(ProductsContext);

  const handleClick = useCallback(() => setActive(!active), [active]);
  const handleChange = useCallback((newValue) => setTagInput(newValue), []);
  const toggleIsToastActive = useCallback(
    () => setIsToastActive((prevState) => !prevState),
    []
  );

  const activator = <Button onClick={handleClick}>Edit product tags</Button>;

  return (
    <div>
      <Modal
        activator={activator}
        open={active}
        onClose={handleClick}
        title={product.title}
        large
      >
        <Modal.Section>
          <Layout>
            <Layout.Section>
              <img src={product.image?.src} alt={product.title} width={200} />
              {product.tags && product.tags.length > 0 ? (
                <Stack alignment="center">
                  <TextStyle variation="strong">Current tags:</TextStyle>
                  {product.tags.split(", ").map((tag, index) => (
                    <Tag
                      key={tag + index}
                      onRemove={() => {
                        setEditingTagInProgress(true);
                        deleteTagFromProduct(
                          redirectUri,
                          appCredentials.app,
                          product,
                          tag
                        ).then(() => {
                          getProducts(
                            redirectUri,
                            appCredentials.app,
                            pageLimit
                          ).then((res) => {
                            setProducts(res.data.body.products);
                            setEditingTagInProgress(false);
                            setToastMessage("Product tag removed");
                            toggleIsToastActive();
                          });
                        });
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Stack>
              ) : (
                <TextStyle variation="subdued">No tags found</TextStyle>
              )}
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
                    loading={editingTagInProgress}
                    onClick={() => {
                      setEditingTagInProgress(true);
                      addTagToProduct(
                        redirectUri,
                        appCredentials.app,
                        product,
                        tagInput
                      ).then((res) => {
                        if (
                          res.message &&
                          res.message === "Tag already exists on product"
                        ) {
                          setTagInput("");
                          setToastError(true);
                          setEditingTagInProgress(false);
                          setToastMessage(res.message);
                          toggleIsToastActive();
                        } else {
                          getProducts(
                            redirectUri,
                            appCredentials.app,
                            pageLimit
                          ).then((res) => {
                            setProducts(res.data.body.products);
                            setTagInput("");
                            setEditingTagInProgress(false);
                            setToastMessage("Product tag added");
                            toggleIsToastActive();
                          });
                        }
                      });
                    }}
                  >
                    Add tag
                  </Button>
                }
              />
            </Layout.Section>
          </Layout>
        </Modal.Section>
      </Modal>
      {isToastActive ? (
        <Toast
          error={toastError}
          content={toastMessage}
          onDismiss={toggleIsToastActive}
          duration={4000}
        />
      ) : null}
    </div>
  );
};

export default ProductModal;
