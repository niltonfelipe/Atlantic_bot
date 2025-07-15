const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  return (
    <div className="flex flex-wrap justify-between items-center mt-4 p-4 bg-white rounded-lg shadow">
      <span className="text-sm text-gray-700 mb-2 sm:mb-0">
        Página {currentPage} de {totalPages} (Total de {totalItems} clientes)
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default Pagination;