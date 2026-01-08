import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Key, Lock } from "lucide-react";
import api from "../services/api";

export default function RecuperarSenha() {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/recuperar-senha", { email });
      setEtapa(2);
      alert("Código enviado para seu e-mail!");
    } catch (error) {
      alert("Erro ao enviar e-mail. Verifique se o endereço está correto.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/redefinir-senha", { email, codigo, novaSenha });
      alert("Senha alterada com sucesso!");
      navigate("/entrar");
    } catch (error) {
      alert("Erro ao redefinir senha. Código inválido ou expirado.");
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
          className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow"
        >
          {etapa === 1 && (
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  className="w-full px-4 py-2 pl-10 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {etapa === 2 && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Código de Verificação</label>
                <div className="relative">
                  <Key className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2 pl-10 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="******"
                    className="w-full px-4 py-2 pl-10 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
          >
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
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft size={18} />
              Voltar para login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}