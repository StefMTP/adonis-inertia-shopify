import { Button, Card, Layout, Select } from "@shopify/polaris";
import React, { useCallback, useContext } from "react";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { ProductsContext } from "../Contexts/ProductsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import { getProducts } from "../Helpers/actions";

const Settings = () => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const {
    productsLoading,
    setProductsLoading,
    setProducts,
    setNextPage,
    setPrevPage,
    setPageNumber,
  } = useContext(ProductsContext);
  const { pageLimit, setPageLimit } = useContext(SettingsContext);
  const pageLimitOptions = [
    { label: "10 per page", value: "10" },
    { label: "25 per page", value: "25" },
    { label: "50 per page", value: "50" },
  ];
  const handlePageLimitChange = useCallback((value) => setPageLimit(value), []);
  return (
    <Card.Subsection>
      <Layout>
        <Layout.Section>
          <Select
            label="Products per page"
            options={pageLimitOptions}
            onChange={handlePageLimitChange}
            value={pageLimit.toString()}
          />
        </Layout.Section>
        <Layout.Section>
          <Button
            primary
            loading={productsLoading}
            onClick={() => {
              setProductsLoading(true);
              getProducts(redirectUri, appCredentials.app, pageLimit).then(
                (res) => {
                  try {
                    setPrevPage(res.data.pageInfo.prevPage);
                  } catch (e) {
                    setPrevPage(false);
                  }
                  try {
                    setNextPage(res.data.pageInfo.nextPage);
                  } catch (e) {
                    setNextPage(false);
                  }
                  setProducts(res.data.body.products);
                  setPageNumber(1);
                  setProductsLoading(false);
                }
              );
            }}
          >
            Save settings
          </Button>
        </Layout.Section>
      </Layout>
    </Card.Subsection>
  );
};

export default Settings;
