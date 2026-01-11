import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import api from "../services/api";

import Alert from "../components/Alert";


export default function Login() {
  const navigate = useNavigate();

<<<<<<< HEAD
  // Estados visuais
  const [mostrarSenha, setMostrarSenha] = useState(false);
=======
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 26af47d64883c4453474caa13f9fe4c019c195e2
  const [isLoading, setIsLoading] = useState(false);

  const [erro, setErro] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");

    try {
      if (!email || !senha) {
        setErro("Preencha todos os campos.");
        setIsLoading(false);
        return;
      }

      const response = await api.post("/auth/login", {
        email,
        senha
      });

      const token = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;


      navigate("/perfil");

    } catch (error) {
      console.error("Erro no login:", error);

      if (error.response?.status === 403 || error.response?.status === 401) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Falha ao entrar. Verifique sua conexão e tente novamente.");
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">

      {/* Título */}
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Bem-vindo!
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Digite suas credenciais para entrar
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      {/* Formulário */}
      <div className="flex justify-center">

        <form
          onSubmit={handleLogin}
          className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg"
        >

          <Alert type="error">{erro}</Alert>


          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                required
                className="w-full px-4 py-2 pl-10 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 pl-10 pr-10 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
              >
                
              </button>
            </div>
          </div>

          {/* Esqueceu senha */}
          <div className="text-right">
            <Link
              to="/recuperar-senha"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-slate-400">ou</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Criar conta */}
          <p className="text-sm text-center text-slate-600">
            Não tem uma conta?{" "}
            <Link
              to="/cadastro"
              className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Criar conta
            </Link>
          </p>

        </form>
      </div>
    </section>
  );
}
