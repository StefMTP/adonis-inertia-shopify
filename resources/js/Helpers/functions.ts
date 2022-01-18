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
    default:
      return value;
  }
};
