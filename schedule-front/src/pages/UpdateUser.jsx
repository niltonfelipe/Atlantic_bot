import { useState } from "react";
import { Link } from "react-router-dom";
import UnderConstruction from "../components/static/UnderConstruction";

function UpdateUser() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   if (!email || !password) {
  //     setError("Preencha todos os campos.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await fakeLoginRequest(email, password);

  //     if (!response.ok) {
  //       throw new Error(response.message || "Erro ao fazer login.");
  //     }

  //     console.log("Usuário autenticado:", response.data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fakeLoginRequest = (email, password) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       if (email === "admin@teste.com" && password === "123456") {
  //         resolve({ ok: true, data: { token: "fake-jwt-token" } });
  //       } else {
  //         resolve({ ok: false, message: "E-mail ou senha inválidos." });
  //       }
  //     }, 1000);
  //   });
  // };

  return (
    // <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">

    //   <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    //     <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    //     <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
    //       Atualizar informações do Administrador (MOCKADO)
    //     </h2>
    //   </div>
    //     <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    //       <form onSubmit={handleLogin} className="space-y-6">
    //         <div>
    //           <label
    //             htmlFor="email"
    //             className="block text-sm/6 font-medium text-gray-900"
    //           >
    //             E-mail
    //           </label>
    //           <div className="mt-2">
    //             <input
    //               id="email"
    //               name="email"
    //               type="email"
    //               required
    //               autoComplete="email"
    //               value={email}
    //               onChange={(e) => setEmail(e.target.value)}
    //               className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
    //             />
    //           </div>
    //         </div>
    //         <div>
    //           <div className="flex items-center justify-between">
    //             <label
    //               htmlFor="name"
    //               className="block text-sm/6 font-medium text-gray-900"
    //             >
    //               Nome
    //             </label>
    //           </div>
    //           <div className="mt-2">
    //             <input
    //               id="name"
    //               name="name"
    //               type="text"
    //               required
    //               // onChange={(e) => setPassword(e.target.value)}
    //               className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
    //             />
    //           </div>
    //         </div>
    //         <div>
    //           <div className="flex items-center justify-between">
    //             <label
    //               htmlFor="password"
    //               className="block text-sm/6 font-medium text-gray-900"
    //             >
    //               Senha
    //             </label>
    //             <div className="text-sm">
    //               <Link
    //                 to="/change-password"
    //                 className="font-semibold text-indigo-600 hover:text-indigo-500"
    //               >
    //                 Trocar senha
    //               </Link>
    //             </div>
    //           </div>
    //           <div className="mt-2">
    //             <input
    //               id="password"
    //               name="password"
    //               type="password"
    //               required
    //               autoComplete="current-password"
    //               value={password}
    //               disabled
    //               className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
    //             />
    //           </div>
    //         </div>
    //         {error && <p className="text-sm text-red-600">{error}</p>}
    //         <div>
    //           <button
    //             type="submit"
    //             disabled={loading}
    //             className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
    //           >
    //             {loading ? "Entrando..." : "Entrar"}
    //           </button>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
    // </div>
    <UnderConstruction/>
  );
}

export default UpdateUser;
