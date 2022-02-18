import {
  Heading,
  Modal,
  ResourceItem,
  ResourceList,
  TextStyle,
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";

const OptionModal = ({
  option,
  active,
  toggleActive,
}: {
  option: { name: string; values: string[] };
  active: boolean;
  toggleActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [optionValues, setOptionValues] = useState([]);
  const handleClick = useCallback(() => {
    setOptionValues([]);
    toggleActive(!active);
  }, [active]);
  return (
    <Modal
      open={active}
      onClose={handleClick}
      title={option.name}
      onTransitionEnd={() => setOptionValues(option.values)}
    >
      <Modal.Section>
        <Heading>
          Values found in your store for the option "{option.name}":
        </Heading>
        <ResourceList
          items={optionValues}
          resourceName={{ singular: "option", plural: "options" }}
          renderItem={(value) => {
            return (
              <ResourceItem id={option.name} onClick={() => {}}>
                <h3>
                  <TextStyle variation="strong">{value}</TextStyle>
                </h3>
              </ResourceItem>
            );
          }}
          loading={!optionValues.length}
        />
      </Modal.Section>
    </Modal>
  );
};

export default OptionModal;
