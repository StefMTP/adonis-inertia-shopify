import { Card, Layout, Stack, Tag, TextStyle } from "@shopify/polaris";
import React, { useContext, useEffect, useState } from "react";
import SkeletonCards from "../Components/SkeletonCards";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import {
  getAllProductsOptions,
  getAllShopProductTags,
  getTotalVariantsCount,
} from "../Helpers/actions";
import CollectionModal from "../Modals/CollectionModal";
import OptionModal from "../Modals/OptionModal";
import TagModal from "../Modals/TagModal";

const Stats = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const {
    productTypes,
    productsTags,
    productsOptions,
    collections,
    totalProductsCount,
    totalVariantsCount,
    setTotalVariantsCount,
    setProductsOptions,
    setProductsTags,
  } = useContext(ProductsContext);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<any>({});
  const [selectedOption, setSelectedOption] = useState<{
    name: string;
    values: string[];
  }>({ name: "", values: [] });

  const [tagModalActive, setTagModalActive] = useState(false);
  const [collectionModalActive, setCollectionModalActive] = useState(false);
  const [optionModalActive, setOptionModalActive] = useState(false);

  useEffect(() => {
    getTotalVariantsCount(redirectUri, appCredentials.app).then((res) => {
      setTotalVariantsCount(res.data.totalVariantsCount);
    });
    getAllProductsOptions(redirectUri, appCredentials.app).then((res) => {
      setProductsOptions(res.data.allOptions);
    });
    getAllShopProductTags(redirectUri, appCredentials.app).then((res) => {
      setProductsTags(
        res.data.body.data.shop.productTags.edges.map((edge) => edge.node)
      );
      console.log(
        res.data.body.data.shop.productTags.edges.map((edge) => edge.node)
      );
    });
  }, []);
  return (
    <Card.Subsection>
      {totalVariantsCount &&
      totalProductsCount &&
      productsTags &&
      productTypes &&
      productsOptions &&
      collections ? (
        <Layout>
          <Layout.Section oneThird>
            <Card
              title="Products"
              actions={[
                {
                  content: "Manage",
                  onAction: () => {
                    console.log("Manage Products");
                  },
                },
              ]}
            >
              <Card.Section>
                <TextStyle variation="subdued">
                  {totalProductsCount} total products in store
                </TextStyle>
              </Card.Section>
              <Card.Section title="Product Types">
                <Stack spacing="loose">
                  {productTypes.map((productType, index) => (
                    <Tag key={productType + index}>{productType}</Tag>
                  ))}
                </Stack>
              </Card.Section>
              <Card.Section title="Collections">
                <Stack spacing="loose">
                  {collections.map((collection) => (
                    <Tag
                      key={collection.id}
                      onClick={() => {
                        setSelectedCollection(collection);
                        setCollectionModalActive(true);
                      }}
                    >
                      {collection.title.length > 12
                        ? collection.title.substring(0, 12) + "..."
                        : collection.title}
                    </Tag>
                  ))}
                </Stack>
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section oneThird>
            <Card
              title="Variants"
              actions={[
                {
                  content: "Manage",
                  onAction: () => {
                    console.log("Manage Variants");
                  },
                },
              ]}
            >
              <Card.Section>
                <TextStyle variation="subdued">
                  {totalVariantsCount} total variants for store products
                </TextStyle>
              </Card.Section>
              <Card.Section title="Options">
                <Stack spacing="loose">
                  {Object.keys(productsOptions).map((option, index) => (
                    <Tag
                      key={option + index}
                      onClick={() => {
                        setSelectedOption({
                          name: option,
                          values: productsOptions[option],
                        });
                        setOptionModalActive(true);
                      }}
                    >
                      {option}
                    </Tag>
                  ))}
                </Stack>
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section oneThird>
            <Card
              title="Tags"
              actions={[
                {
                  content: "Manage",
                  onAction: () => {
                    console.log(productsTags);
                  },
                },
              ]}
            >
              <Card.Section>
                <TextStyle variation="subdued">
                  {productsTags.length} total tags for store products
                </TextStyle>
              </Card.Section>
              <Card.Section>
                <Stack spacing="loose">
                  {productsTags.map((tag, index) => (
                    <Tag
                      key={`${tag}-${index}`}
                      onClick={() => {
                        setSelectedTag(tag);
                        setTagModalActive(true);
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Stack>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      ) : (
        <SkeletonCards />
      )}
      <TagModal
        tag={selectedTag}
        active={tagModalActive}
        toggleActive={setTagModalActive}
      />
      <CollectionModal
        collectionId={selectedCollection.id}
        collectionTitle={selectedCollection.title}
        active={collectionModalActive}
        toggleActive={setCollectionModalActive}
      />
      <OptionModal
        option={selectedOption}
        active={optionModalActive}
        toggleActive={setOptionModalActive}
      />
    </Card.Subsection>
  );
};

export default Stats;
