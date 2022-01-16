import React, { createContext, useEffect, useState } from "react";
import { getDefaultSettings } from "../Helpers/actions";

type SettingsContextProviderProps = {
  children: React.ReactNode;
  redirectUri: string;
};

type SettingsContextType = {
  pageLimit: number;
  setPageLimit: React.Dispatch<React.SetStateAction<number>>;
};

const settingsDefaultValue: SettingsContextType = {
  pageLimit: 10,
  setPageLimit: () => {},
};

export const SettingsContext = createContext(settingsDefaultValue);

const SettingsProvider = ({
  children,
  redirectUri,
}: SettingsContextProviderProps) => {
  const [pageLimit, setPageLimit] = useState(settingsDefaultValue.pageLimit);

  useEffect(() => {
    getDefaultSettings(redirectUri).then((res) => {
      console.log(res.data);
      setPageLimit(res.data.pageLimit);
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ pageLimit, setPageLimit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
