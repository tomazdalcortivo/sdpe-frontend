import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, Lock } from "lucide-react";
import api from "../services/api";
import Alert from "../components/Alert";

export default function RecuperarSenha() {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      await api.post("/auth/recuperar-senha", { email });
      setEtapa(2);
      setMensagem("Código enviado! Verifique seu e-mail (inclusive spam).");
    } catch (error) {
      console.error(error);
      setErro("Não foi possível enviar o e-mail. Verifique se o endereço está correto.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      await api.post("/auth/redefinir-senha", { email, codigo, novaSenha });
      setMensagem("Senha alterada com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/entrar");
      }, 2500);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setErro(error.response.data);
      } else {
        setErro("Erro ao redefinir senha. Verifique o código e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-gradient-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Recuperar senha
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          {etapa === 1
            ? "Enviaremos um código para redefinir sua senha"
            : "Digite o código recebido e sua nova senha"}
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      <div className="flex justify-center">
        <form
          onSubmit={etapa === 1 ? handleEnviarEmail : handleRedefinirSenha}
          className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg"
        >
          <Alert type="error">{erro}</Alert>
          <Alert type="success">{mensagem}</Alert>

          {etapa === 1 && (
            <div className="animate-fadeIn">
              <label className="block mb-1 text-sm font-medium text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="w-full px-4 py-2 pl-10 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Código de Verificação
                </label>
                <div className="relative">
                  <KeyRound className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full px-4 py-2 pl-10 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="******"
                    className="w-full px-4 py-2 pl-10 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            )}
            {loading ? "Processando..." : (etapa === 1 ? "Enviar código" : "Redefinir Senha")}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-slate-400">ou</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="text-center">
            <Link
              to="/entrar"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-emerald-600 hover:text-emerald-700 group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Voltar para login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}