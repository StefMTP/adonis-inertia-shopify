import React, { useState, useCallback } from "react";
import { Card, Page, Tabs } from "@shopify/polaris";
import Products from "../Tabs/Products";
import Settings from "../Tabs/Settings";
import Stats from "../Tabs/Stats";

const AppTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = useCallback((newTab) => setSelectedTab(newTab), []);

  const tabs: {
    id: string;
    content: string;
    accessibilityLabel: string;
    panelID: string;
  }[] = [
    {
      id: "1",
      content: "Products",
      accessibilityLabel: "products",
      panelID: "products-content-1",
    },
    {
      id: "2",
      content: "Statistics",
      accessibilityLabel: "stats",
      panelID: "stats-content-2",
    },
    {
      id: "3",
      content: "Settings",
      accessibilityLabel: "settings",
      panelID: "settings-content-3",
    },
  ];

  const tabComponents = [<Products />, <Stats />, <Settings />];

  return (
    <Page>
      <Card title="Product Extravaganza">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
          <Card.Section>{tabComponents[selectedTab]}</Card.Section>
        </Tabs>
      </Card>
    </Page>
  );
};

export default AppTabs;
