import { ClientApplication, createApp } from "@shopify/app-bridge";
import React, { createContext, useEffect, useState } from "react";
import { getAppCredentials } from "../Helpers/actions";

type AppCredentialsContextProviderProps = {
  children: React.ReactNode;
  shop: string;
  redirectUri: string;
};

type AppCredentialsContextType = {
  appCredentials: appCredentials;
  setAppCredentials: React.Dispatch<React.SetStateAction<appCredentials>>;
  redirectUri: string;
};

export type appCredentials = {
  apiKey: string;
  host: string;
  app: ClientApplication<any> | null;
};

const appCredentialsDefaultValue: AppCredentialsContextType = {
  appCredentials: {
    apiKey: "",
    host: "",
    app: null,
  },
  setAppCredentials: () => {},
  redirectUri: "",
};

export const AppCredentialsContext = createContext(appCredentialsDefaultValue);

const AppCredentialsProvider = ({
  children,
  shop,
  redirectUri,
}: AppCredentialsContextProviderProps) => {
  const [appCredentials, setAppCredentials]: [
    appCredentials,
    React.Dispatch<React.SetStateAction<appCredentials>>
  ] = useState(appCredentialsDefaultValue.appCredentials);

  useEffect(() => {
    getAppCredentials(redirectUri, shop).then((res) => {
      const app = createApp({
        apiKey: res.data.apiKey,
        host: res.data.host,
      });
      setAppCredentials({ ...appCredentials, ...res.data, app: app });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppCredentialsContext.Provider
      value={{ appCredentials, redirectUri, setAppCredentials }}
    >
      {children}
    </AppCredentialsContext.Provider>
  );
};

export default AppCredentialsProvider;
