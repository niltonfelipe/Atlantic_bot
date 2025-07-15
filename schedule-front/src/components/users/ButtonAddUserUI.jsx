const ButtonAddUserUI = ({ onAdd, addLabel = "Adicionar", isLoading = false }) => {
  return (
    <button
      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out"
      onClick={onAdd}
      disabled={isLoading}
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
      {addLabel}
    </button>
  );
};

export default ButtonAddUserUI;
