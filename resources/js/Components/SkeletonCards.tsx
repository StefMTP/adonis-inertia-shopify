import {
  Card,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
} from "@shopify/polaris";
import React from "react";

const SkeletonCards = () => {
  return (
    <Layout>
      <Layout.Section oneThird>
        <Card title="Products">
          <Card.Section>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </TextContainer>
          </Card.Section>
          <Card.Section>
            <SkeletonBodyText />
          </Card.Section>
        </Card>
      </Layout.Section>
      <Layout.Section oneThird>
        <Card title="Variants">
          <Card.Section>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </TextContainer>
          </Card.Section>
          <Card.Section>
            <SkeletonBodyText />
          </Card.Section>
        </Card>
      </Layout.Section>
      <Layout.Section oneThird>
        <Card title="Tags">
          <Card.Section>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={2} />
            </TextContainer>
          </Card.Section>
          <Card.Section>
            <SkeletonBodyText />
          </Card.Section>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export default SkeletonCards;
