import Sidebar from "./Sidebar";

const UnderConstruction = () => {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <p className="text-6xl mb-6 animate-bounce pointer-events-none">🚧</p>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Em Construção!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Por aqui está tudo bagunçado, mas em breve haverá novas
            atualizações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
