const ActionButtons = ({
  selectedRows,
  onEdit,
  onDelete,
  isLoading,
  hideEditButton = false, // nova prop
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:justify-between mb-5">
      <div className="flex gap-2">
        {selectedRows.length > 0 && (
          <>
            {!hideEditButton && (
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  selectedRows.length !== 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white"
                }`}
                onClick={onEdit}
                disabled={selectedRows.length !== 1 || isLoading}
              >
                Editar
              </button>
            )}

            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out"
              onClick={onDelete}
              disabled={isLoading || selectedRows.length === 0}
            >
              Excluir Selecionado(s)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
