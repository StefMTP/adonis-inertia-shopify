import {
  Badge,
  Heading,
  List,
  Modal,
  ResourceItem,
  ResourceList,
  Spinner,
  Stack,
  TextContainer,
  TextStyle,
} from "@shopify/polaris";
import React, { useState, useCallback, useContext } from "react";
import { product } from "../../../app/Helpers/ShopifyTypes";
import { AppCredentialsContext } from "../Contexts/AppCredentialsContext";
import { getTagProducts } from "../Helpers/actions";

const TagModal = ({
  tag,
  active,
  toggleActive,
}: {
  tag: string;
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { redirectUri, appCredentials } = useContext(AppCredentialsContext);
  const [tagProducts, setTagProducts] = useState<string[]>([]);
  const handleClick = useCallback(() => {
    setTagProducts([]);
    toggleActive(!active);
  }, [active]);

  return (
    <Modal
      open={active}
      onTransitionEnd={() => {
        getTagProducts(redirectUri, appCredentials.app, tag).then((res) =>
          setTagProducts(res.data.productNames)
        );
      }}
      onClose={handleClick}
      title={tag}
              return (
                <ResourceItem
                  id={product.id}
                  onClick={() => {
                    Redirect.create(appCredentials.app).dispatch(
                      Redirect.Action.REMOTE,
                      `https://${shop}/admin/products/${product.id}`
                    );
                  }}
                >
                  <TextStyle variation="strong">{product}</TextStyle>
                </h3>
              </ResourceItem>
            );
          }}
          loading={!tagProducts.length}
        />
      </Modal.Section>
    </Modal>
  );
};

export default TagModal;
