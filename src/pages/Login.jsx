import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

const styles = {
  page: "min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  title: "mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text",
  subtitle: "max-w-2xl mx-auto text-xl text-slate-600",
  divider: "h-px mx-auto my-10 bg-gray-300 w-lg",
  card: "w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg",
  label: "block mb-1 text-sm font-medium text-slate-700",
  inputWrapper: "relative",
  input: "w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  inputIcon: "absolute w-5 h-5 -translate-y-1/2 text-slate-400 left-3 top-1/2",
  button: "flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed",
};

export default function Login() {
  const navigate = useNavigate();

  const [mostrarSenha, setMostrarSenha] = useState(false);
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
        senha,
      });

      const token = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/perfil");
    } catch (error) {
      console.error("Erro no login:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Falha ao entrar. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      {/* Cabeçalho */}
      <div className="mt-16 mb-10 text-center">
        <h1 className={styles.title}>Bem-vindo!</h1>
        <p className={styles.subtitle}>
          Digite suas credenciais para entrar.
        </p>
      </div>

      <div className={styles.divider}></div>

      {/* Formulário */}
      <div className="flex justify-center">
        <form onSubmit={handleLogin} className={styles.card}>
          <Alert type="error">{erro}</Alert>

          {/* Email */}
          <div>
            <label className={styles.label}>E-mail</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                required
                className={`${styles.input} pl-10`}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className={`${styles.input} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
              />
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

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
            )}
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
