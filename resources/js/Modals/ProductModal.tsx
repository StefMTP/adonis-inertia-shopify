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
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import {
  addTagToProduct,
  deleteTagFromProduct,
  getProduct,
  getProducts,
} from "../Helpers/actions";
import { product } from "./../../../app/Helpers/ShopifyTypes";

const ProductModal = ({
  product,
  active,
  toggleActive,
}: {
  product: product;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [tagInput, setTagInput] = useState("");
  const [editingTagInProgress, setEditingTagInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [isToastActive, setIsToastActive] = useState(false);
  const [productTags, setProductTags] = useState("");

  const { appCredentials, redirectUri } = useContext(AppCredentialsContext);
  const { pageLimit } = useContext(SettingsContext);
  const { setProducts } = useContext(ProductsContext);

  const handleClick = useCallback(() => toggleActive(!active), [active]);
  const handleChange = useCallback((newValue) => setTagInput(newValue), []);
  const toggleIsToastActive = useCallback(
    () => setIsToastActive((prevState) => !prevState),
    []
  );

  return (
    <div>
      <Modal
        open={active}
        onClose={handleClick}
        title={product.title}
        large
        onTransitionEnd={() => setProductTags(product.tags)}
      >
        <Modal.Section>
          <Layout>
            <Layout.Section>
              <img src={product.image?.src} alt={product.title} width={200} />
              {productTags && productTags.length > 0 ? (
                <Stack alignment="center">
                  <TextStyle variation="strong">Current tags:</TextStyle>
                  {productTags.split(", ").map((tag, index) => (
                    <Tag
                      key={tag + index}
                      onRemove={() => {
                        setEditingTagInProgress(true);
                        deleteTagFromProduct(
                          redirectUri,
                          appCredentials.app,
                          productTags,
                          product.id,
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
                          getProduct(
                            redirectUri,
                            appCredentials.app,
                            product.id,
                            ["tags"]
                          ).then((res) => {
                            setProductTags(res.data.body.product.tags);
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
                        productTags,
                        product.id,
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
                            setToastError(false);
                            setEditingTagInProgress(false);
                            setToastMessage("Product tag added");
                            toggleIsToastActive();
                          });
                          getProduct(
                            redirectUri,
                            appCredentials.app,
                            product.id,
                            ["tags"]
                          ).then((res) => {
                            setProductTags(res.data.body.product.tags);
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
