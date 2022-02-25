import {
  Autocomplete,
  Badge,
  Button,
  Layout,
  Modal,
  Stack,
  Tag,
  TextField,
  TextStyle,
  Toast,
} from "@shopify/polaris";
// import { CirclePlusMinor } from "@shopify/polaris-icons";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import {
  addTagToProduct,
  deleteTagFromProduct,
  editProductType,
  getProduct,
  getProducts,
} from "../Helpers/actions";
import { product } from "./../../../app/Helpers/ShopifyTypes";

const ProductModal = ({
  product,
  active,
  toggleActive,
  pageRefresher,
}: {
  product: product;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
  pageRefresher: (page: any, increment: number) => void;
}) => {
  const [tagInput, setTagInput] = useState("");
  const [editingTagInProgress, setEditingTagInProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const [isToastActive, setIsToastActive] = useState(false);
  const [productTags, setProductTags] = useState("");

  const { appCredentials, redirectUri } = useContext(AppCredentialsContext);
  const { pageLimit } = useContext(SettingsContext);
  const { setProducts, productTypes, setProductsLoading, currentPage } =
    useContext(ProductsContext);

  const [productTypeInput, setProductTypeInput] = useState("");
  const [editingTypeInProgress, setEditingTypeInProgress] = useState(false);
  const [productType, setProductType] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);

  const handleClick = useCallback(() => toggleActive(!active), [active]);
  const handleChange = useCallback((newValue) => setTagInput(newValue), []);
  const toggleIsToastActive = useCallback(
    () => setIsToastActive((prevState) => !prevState),
    []
  );
  const updateText = useCallback(
    (value) => {
      setProductTypeInput(value);

      if (!loading) {
        setLoading(true);
      }

      setTimeout(() => {
        if (value === "") {
          setOptions(
            productTypes.map((type) => {
              return { value: type, label: type };
            })
          );
          setLoading(false);
          return;
        }
        const filterRegex = new RegExp(value, "i");
        const resultOptions = options.filter((option) =>
          option.label.match(filterRegex)
        );
        setOptions(resultOptions);
        setLoading(false);
      }, 300);
    },
    [productTypes, loading, options]
  );

  const updateSelection = useCallback(
    (selected) => {
      const selectedText = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });
      setSelectedOptions(selected);
      setProductTypeInput(selectedText[0]);
    },
    [options]
  );

  return (
    <>
      <Modal
        open={active}
        onClose={handleClick}
        title={
          <div>
            {product.title}
            <Badge status={productType ? "info" : "attention"}>
              {productType || "No product type"}
            </Badge>
          </div>
        }
        large
        onTransitionEnd={() => {
          setOptions(
            productTypes.map((type) => {
              return { value: type, label: type };
            })
          );
          setProductTags(product.tags);
          getProduct(redirectUri, appCredentials.app, product.id, [
            "product_type",
          ]).then((res) => {
            setProductType(res.data.body.product.product_type);
            setProductTypeInput(res.data.body.product.product_type);
          });
        }}
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
                          getProduct(
                            redirectUri,
                            appCredentials.app,
                            product.id,
                            ["tags"]
                          ).then((res) => {
                            setEditingTagInProgress(false);
                            setToastMessage("Product tag removed");
                            toggleIsToastActive();
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
                disabled={editingTagInProgress}
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
                          // getProducts(
                          //   redirectUri,
                          //   appCredentials.app,
                          //   pageLimit
                          // ).then((res) => {
                          //   setProducts(res.data.body.products);

                          // });
                          getProduct(
                            redirectUri,
                            appCredentials.app,
                            product.id,
                            ["tags"]
                          ).then((res) => {
                            setProductTags(res.data.body.product.tags);
                            setTagInput("");
                            setToastError(false);
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
            <Layout.Section>
              <Stack alignment="center">
                <Autocomplete
                  // actionBefore={
                  //   options.length <= 0 && {
                  //     content: `Add product type ${productTypeInput}`,
                  //     icon: CirclePlusMinor,
                  //     onAction: () => console.log(options),
                  //   }
                  // }
                  onSelect={updateSelection}
                  options={options}
                  selected={selectedOptions}
                  textField={
                    <Autocomplete.TextField
                      label=""
                      value={productTypeInput}
                      onChange={updateText}
                      placeholder="Change product type..."
                      autoComplete="off"
                    />
                  }
                />
                <Button
                  loading={editingTypeInProgress}
                  onClick={() => {
                    setEditingTypeInProgress(true);
                    setProductsLoading(true);
                    editProductType(
                      redirectUri,
                      appCredentials.app,
                      product.id,
                      productTypeInput
                    )
                      .then((res) => {
                        setProductType(res.data.newProductType);
                        getProducts(
                          redirectUri,
                          appCredentials.app,
                          pageLimit
                        ).then((res) => {
                          setProducts(res.data.body.products);
                          setEditingTypeInProgress(false);
                          setProductsLoading(false);
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                >
                  Edit product type
                </Button>
              </Stack>
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
    </>
  );
};

export default ProductModal;
