import { useCallback } from "react";

import { useErrorContext } from "../contexts/ErrorContext";
import { useLoaderContext } from "../contexts/LoaderContext";
import { useLogContext } from "../contexts/LogContext";
import Label from "../../labels";
import { attempt } from "../../utils";
import { fetchConfig, findMirror } from "../../api/data/config";

export const useConfig = () => {
  const { throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();
  const { setIsLoading, setLoaderMessage } = useLoaderContext();

  const getConfig = useCallback(async () => {
    // Fetch configuration from the github
    setLoaderMessage(Label.FETCHING_CONFIG);
    setIsLoading(true);

    const config = await attempt(
      async () => {
        const config = await fetchConfig();
        clearLog();
        return config;
      },
      pushLog,
      throwError,
      clearLog
    );

    if (!config) {
      return {};
    }

    // Find an available mirror
    setLoaderMessage(Label.FINDING_MIRROR);
    const mirror = await findMirror(config.mirrors, (failedMirror: string) => {
      setLoaderMessage(
        `${Label.COULDNT_REACH_TO_MIRROR}, ${failedMirror}. ${Label.FINDING_MIRROR}`
      );
    });

    if (!mirror) {
      setIsLoading(false);
      throwError("Couldn't find an available libgen mirror.");
      return {};
    }

    setIsLoading(false);

    return { config, mirror };
  }, [pushLog, clearLog, setIsLoading, setLoaderMessage, throwError]);

  return { getConfig };
};
