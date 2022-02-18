export const isEmpty = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else {
    return value === "" || value == null;
  }
};

export const disambiguateLabel = (key, value) => {
  switch (key) {
    case "status":
      return `Product status is ${value}`;
    case "productType":
      return `Product types: ${value.join(", ")}`;
    case "collection":
      return `Products of collection: ${value}`;
    default:
      return value;
  }
};

export const getIdfromGid = (value: string): string => {
  return value.split("/")[value.split("/").length - 1];
};
