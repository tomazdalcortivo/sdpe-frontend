import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function RecuperarSenha() {
  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-gradient-to-br from-emerald-100 via-white to-amber-100">
      {/* Cabeçalho */}
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Recuperar senha
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Enviaremos um link para redefinir sua senha
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      {/* Formulário */}
      <div className="flex justify-center">
        <form className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2" />
              <input
                type="email"
                placeholder="nome@email.com"
                className="w-full px-4 py-2 pl-10 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full py-3 mt-4 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700"
          >
            Enviar link de recuperação
          </button>

          {/* Linha divisória */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-slate-400">ou</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Voltar */}
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
