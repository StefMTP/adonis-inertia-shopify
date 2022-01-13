import { useState, useCallback } from "react";
import { Card, Page, Tabs } from "@shopify/polaris";
import Products from "../Tabs/Products";
import Settings from "../Tabs/Settings";

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
      content: "Settings",
      accessibilityLabel: "settings",
      panelID: "settings-content-2",
    },
  ];

  const tabComponents = [<Products />, <Settings />];

  return (
    <Page>
      <Card>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
          <Card.Section title={tabs[selectedTab].content}>
            {tabComponents[selectedTab]}
          </Card.Section>
        </Tabs>
      </Card>
    </Page>
  );
};

export default AppTabs;
