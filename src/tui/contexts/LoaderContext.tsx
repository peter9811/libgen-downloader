import React, { Dispatch, SetStateAction, useState, useContext } from "react";
import { Box, Text } from "ink";

import SpinnerText from "../components/SpinnerText";

export interface ILoaderContext {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  loaderMessage: string;
  setLoaderMessage: Dispatch<SetStateAction<string>>;
}

export const LoaderContext = React.createContext<ILoaderContext | undefined>(undefined);

export const useLoaderContext = () => {
  return useContext(LoaderContext) as ILoaderContext;
};

export const LoaderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");

  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        setIsLoading,
        loaderMessage,
        setLoaderMessage,
      }}
    >
      {isLoading && (
        <SpinnerText>
          <Text>{loaderMessage}</Text>
        </SpinnerText>
      )}
      <Box width="100%" display={isLoading ? "none" : "flex"}>
        {children}
      </Box>
    </LoaderContext.Provider>
  );
};
