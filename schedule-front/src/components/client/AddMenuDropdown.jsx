const AddMenuDropdown = ({
  show,
  onToggle,
  onAddClient,
  onAddZone,
}) => {
  return (
    <div className="relative w-full">
      <div className="w-full">
      <button
        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out w-full"
        onClick={onToggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Adicionar
      </button>
      </div>


      {show && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 ">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onAddClient}
          >
            Adicionar Cliente
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onAddZone}
          >
            Adicionar Zona
          </button>
        </div>
      )}
    </div>
  );
};

export default AddMenuDropdown;