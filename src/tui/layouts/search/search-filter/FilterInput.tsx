import React, { useCallback } from "react";
import { useFocus } from "ink";

import Input from "../../../components/Input";
import { FilterKey } from "./Filter.data";
import { useAppStateContext } from "../../../contexts/AppStateContext";

const FilterInput: React.FC<{
  label: string;
  filterKey: FilterKey;
}> = ({ label, filterKey }) => {
  const { filters, setFilters } = useAppStateContext();

  const { isFocused } = useFocus({ autoFocus: true });

  const handleInputChange = useCallback(
    (val: string) => {
      setFilters({
        ...filters,
        [filterKey]: val,
      });
    },
    [filters, filterKey, setFilters]
  );

  return (
    <Input
      label={label}
      placeholder=""
      isFocused={isFocused}
      searchValue={filters[filterKey] || ""}
      onSearchValueChange={handleInputChange}
    />
  );
};

export default FilterInput;
