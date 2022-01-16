import React from "react";
import "@shopify/polaris/build/esm/styles.css";
import { AppProvider, Frame } from "@shopify/polaris";
import AppTabs from "../Components/AppTabs";
import AppCredentialsProvider from "../Contexts/AppCredentialsContext";
import translations from "@shopify/polaris/locales/en.json";
import ProductsProvider from "../Contexts/ProductsContext";
import SettingsProvider from "../Contexts/SettingsContext";

const Index = ({ shop, redirectUri }) => {
  return (
    <AppProvider i18n={translations}>
      <AppCredentialsProvider shop={shop} redirectUri={redirectUri}>
        <SettingsProvider redirectUri={redirectUri}>
          <ProductsProvider redirectUri={redirectUri}>
            <Frame>
              <AppTabs />
            </Frame>
          </ProductsProvider>
        </SettingsProvider>
      </AppCredentialsProvider>
    </AppProvider>
  );
};

export default Index;
