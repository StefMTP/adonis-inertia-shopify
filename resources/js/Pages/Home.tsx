import React from "react";
import translations from "@shopify/polaris/locales/en.json";
import { AppProvider, Frame } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import AppTabs from "../Components/AppTabs";

const Home = () => {
  return (
    <AppProvider i18n={translations}>
      <Frame>
        <AppTabs />
      </Frame>
    </AppProvider>
  );
};

export default Home;
