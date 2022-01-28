import { Card, Layout, TextStyle } from "@shopify/polaris";
import React, { useContext, useEffect } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { getTotalVariantsCount } from "../Helpers/actions";

const Stats = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const {
    productsTags,
    totalVariantsCount,
    setTotalVariantsCount,
    totalProductsCount,
  } = useContext(ProductsContext);

  useEffect(() => {
    getTotalVariantsCount(redirectUri, appCredentials.app).then((res) => {
      setTotalVariantsCount(res.data.totalVariantsCount);
    });
  }, []);
  return (
    <Card.Subsection>
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
            <Card.Section></Card.Section>
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
            <Card.Section></Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Card.Subsection>
  );
};

export default Stats;
