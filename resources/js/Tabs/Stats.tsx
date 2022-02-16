import { Badge, Card, Layout, Stack, TextStyle } from "@shopify/polaris";
import React, { useContext, useEffect, useState } from "react";
import SkeletonCards from "../Components/SkeletonCards";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { getTotalVariantsCount } from "../Helpers/actions";
import CollectionModal from "../Modals/CollectionModal";
import TagModal from "../Modals/TagModal";

const Stats = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const {
    productTypes,
    productsTags,
    collections,
    totalVariantsCount,
    setTotalVariantsCount,
    totalProductsCount,
  } = useContext(ProductsContext);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<any>({});
  const [tagModalActive, setTagModalActive] = useState(false);
  const [collectionModalActive, setCollectionModalActive] = useState(false);

  useEffect(() => {
    getTotalVariantsCount(redirectUri, appCredentials.app).then((res) => {
      setTotalVariantsCount(res.data.totalVariantsCount);
    });
  }, []);
  return (
    <Card.Subsection>
      {totalVariantsCount &&
      totalProductsCount &&
      productsTags &&
      productTypes &&
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
                    <Badge key={productType + index}>{productType}</Badge>
                  ))}
                </Stack>
              </Card.Section>
              <Card.Section title="Collections">
                <Stack spacing="loose">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      onClick={() => {
                        setSelectedCollection(collection);
                        setCollectionModalActive(true);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <Badge>
                        {collection.title.length > 12
                          ? collection.title.substring(0, 12) + "..."
                          : collection.title}
                      </Badge>
                    </div>
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
              <Card.Section></Card.Section>
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
                    <div
                      onClick={() => {
                        setSelectedTag(tag);
                        setTagModalActive(true);
                      }}
                      key={`${tag}-${index}`}
                      style={{ cursor: "pointer" }}
                    >
                      <Badge>{tag}</Badge>
                    </div>
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
    </Card.Subsection>
  );
};

export default Stats;
