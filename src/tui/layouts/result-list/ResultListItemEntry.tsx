import React, { useEffect, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { useErrorContext } from "../../contexts/ErrorContext";
import { useLogContext } from "../../contexts/LogContext";
import { useResultListContext } from "../../contexts/ResultListContext";
import { ResultListEntryOption } from "../../../options";
import Label from "../../../labels";
import { parseDownloadUrls } from "../../../api/data/url";
import { getDocument } from "../../../api/data/document";
import { ResultListItemEntry } from "../../../api/models/ListItem";
import { attempt } from "../../../utils";
import { useAppContext } from "../../contexts/AppContext";
import { SEARCH_PAGE_SIZE } from "../../../settings";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isExpanded, isFadedOut }) => {
  const { currentPage, setAnyEntryExpanded, setActiveExpandedListLength, bulkQueue } =
    useAppContext();

  const { throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();

  const {
    handleSeeDetailsOptions,
    handleDownloadDirectlyOption,
    handleBulkDownloadQueueOption,
    handleTurnBackToTheListOption,
  } = useResultListContext();

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);

  const [entryOptions, setEntryOptions] = useState<Record<string, IOption>>({
    [ResultListEntryOption.SEE_DETAILS]: {
      label: Label.SEE_DETAILS,
      onSelect: () => handleSeeDetailsOptions(item.data),
    },
    [ResultListEntryOption.DOWNLOAD_DIRECTLY]: {
      label: Label.DOWNLOAD_DIRECTLY,
      onSelect: handleDownloadDirectlyOption,
    },
    [ResultListEntryOption.ALTERNATIVE_DOWNLOADS]: {
      label: Label.ALTERNATIVE_DOWNLOADS,
      loading: true,
      onSelect: () => undefined,
    },
    [ResultListEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: bulkQueue[item.data.id]
        ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
        : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      onSelect: () => handleBulkDownloadQueueOption(item.data),
    },
    [ResultListEntryOption.TURN_BACK_TO_THE_LIST]: {
      label: Label.TURN_BACK_TO_THE_LIST,
      onSelect: handleTurnBackToTheListOption,
    },
  });

  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);
  const [alternativeDownloadOptions, setAlternativeDownloadOptions] = useState<
    Record<string, IOption>
  >({});

  useEffect(() => {
    setEntryOptions({
      [ResultListEntryOption.SEE_DETAILS]: {
        label: Label.SEE_DETAILS,
        onSelect: () =>
          handleSeeDetailsOptions({
            ...item.data,
            downloadUrls: alternativeDownloadURLs,
          }),
      },
      [ResultListEntryOption.DOWNLOAD_DIRECTLY]: {
        label: Label.DOWNLOAD_DIRECTLY,
        onSelect: handleDownloadDirectlyOption,
      },
      [ResultListEntryOption.ALTERNATIVE_DOWNLOADS]: {
        label: `${Label.ALTERNATIVE_DOWNLOADS} (${alternativeDownloadURLs.length})`,
        loading: alternativeDownloadURLs.length === 0,
        onSelect: () => {
          setActiveExpandedListLength(alternativeDownloadURLs.length + 1);
          setShowAlternativeDownloads(true);
        },
      },
      [ResultListEntryOption.BULK_DOWNLOAD_QUEUE]: {
        label: bulkQueue[item.data.id]
          ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
          : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
        onSelect: () => handleBulkDownloadQueueOption(item.data),
      },
      [ResultListEntryOption.TURN_BACK_TO_THE_LIST]: {
        label: Label.TURN_BACK_TO_THE_LIST,
        onSelect: handleTurnBackToTheListOption,
      },
    });
  }, [
    alternativeDownloadURLs,
    bulkQueue,
    handleSeeDetailsOptions,
    handleDownloadDirectlyOption,
    handleBulkDownloadQueueOption,
    handleTurnBackToTheListOption,
    item.data,
    setActiveExpandedListLength,
  ]);

  useInput(
    (_, key: Key) => {
      if (key.return) {
        setAnyEntryExpanded(true);
        setActiveExpandedListLength(Object.keys(entryOptions).length);
      }
    },
    { isActive: isActive && !isExpanded }
  );

  useEffect(() => {
    let isMounted = true;

    if (!isExpanded || Object.keys(alternativeDownloadOptions).length > 0) {
      return;
    }

    const fetchDownloadUrls = async () => {
      const pageDocument = await attempt(
        () => getDocument(item.data.mirror),
        pushLog,
        throwError,
        clearLog
      );

      if (!pageDocument || !isMounted) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, throwError);

      if (!parsedDownloadUrls) {
        return;
      }

      setAlternativeDownloadURLs(parsedDownloadUrls);

      setAlternativeDownloadOptions({
        ...parsedDownloadUrls.reduce<Record<string, IOption>>((prev, current, idx) => {
          return {
            ...prev,
            [idx]: {
              label: `(Mirror ${idx + 1}) ${current}`,
              onSelect: () => undefined,
            },
          };
        }, {}),
        [ResultListEntryOption.BACK_TO_ENTRY_OPTIONS]: {
          label: Label.BACK_TO_ENTRY_OPTIONS,
          onSelect: () => {
            setShowAlternativeDownloads(false);
            setActiveExpandedListLength(Object.keys(entryOptions).length);
          },
        },
      });
    };

    fetchDownloadUrls();

    return () => {
      isMounted = false;
    };
  }, [
    isExpanded,
    item.data,
    item.data.mirror,
    pushLog,
    clearLog,
    throwError,
    setActiveExpandedListLength,
    entryOptions,
    alternativeDownloadOptions,
    handleSeeDetailsOptions,
  ]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "cyanBright" : ""}
        bold={isActive}
      >
        {isActive && !isExpanded && figures.pointer} [
        {item.order + (currentPage - 1) * SEARCH_PAGE_SIZE}]{" "}
        <Text color={isFadedOut ? "gray" : "green"} bold={true}>
          {item.data.extension}
        </Text>{" "}
        {item.data.title}
      </Text>

      {isExpanded &&
        (showAlternativeDownloads ? (
          <OptionList key={"alternativeDownloads"} options={alternativeDownloadOptions} />
        ) : (
          <OptionList key={"entryOptions"} options={entryOptions} />
        ))}
    </Box>
  );
};

export default ResultListItemEntry;
