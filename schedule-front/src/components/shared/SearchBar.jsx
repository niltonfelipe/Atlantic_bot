import Select from "react-select";

const SearchBar = ({
  filterOptions,
  filterField,
  onFilterChange,
  search,
  onSearchChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <Select
        isSearchable={false}
        className="w-full sm:w-48 text-sm"
        options={filterOptions}
        value={filterField}
        onChange={onFilterChange}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#15803d" : "#cbd5e1",
            boxShadow: state.isFocused ? "0 0 0 1px #15803d" : "none",
            "&:hover": { borderColor: "#cbd5e1" },
            minHeight: 40,
            borderRadius: 6,
            fontSize: "0.875rem",
          }),
          singleValue: (base) => ({ ...base, color: "#15803d" }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
              ? "#15803d"
              : isFocused
              ? "#f1f5f9"
              : "white",
            color: isSelected ? "white" : "black",
            padding: 10,
            cursor: "pointer",
          }),
          menu: (base) => ({ ...base, zIndex: 9999 }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
      />

      <input
        type="text"
        className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-72 text-sm focus:ring-2 focus:ring-green-700 focus:border-green-800"
        placeholder={`Buscar por ${filterField.label.toLowerCase()}...`}
        value={search}
        onChange={onSearchChange}
      />

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        title="Recarregar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M15 15H9"
          />
        </svg>
        Recarregar
      </button>
    </div>
  );
};

export default SearchBar;
