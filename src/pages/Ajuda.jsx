import { useState, useEffect, useRef } from "react";
import "altcha";
import "altcha/i18n/pt-br";
import api from "../services/api";
import Alert from "../components/Alert";

const message_max = 500;

const styles = {
  page: "min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  title: "mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text",
  subtitle: "max-w-2xl mx-auto text-xl text-slate-600",
  divider: "h-px mx-auto my-10 bg-gray-300 w-lg",
  card: "w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg border border-gray-100",
  label: "block mb-1 text-sm font-medium text-slate-700",
  input: "w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  button: "flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed",
};

const fields = [
  { name: "nome", label: "Nome Completo", type: "text", placeholder: "Seu nome completo" },
  { name: "email", label: "E-mail", type: "email", placeholder: "usuario@email.com" },
];

export default function Ajuda() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: false });
  const [altchaPayload, setAltchaPayload] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    const handleVerified = (ev) => setAltchaPayload(ev.detail.payload);
    const widget = widgetRef.current;
    if (widget) widget.addEventListener('verified', handleVerified);
    return () => {
      if (widget) widget.removeEventListener('verified', handleVerified);
    };
  }, []);

  const handleAlteracao = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!formData.assunto || !formData.mensagem || !formData.email || !formData.nome) {
      setStatus({ loading: false, error: "Por favor, preencha todos os campos.", success: false });
      return;
    }

    if (!altchaPayload) {
      setStatus({ loading: false, error: "Por favor, verifique o captcha.", success: false });
      return;
    }

    setStatus({ loading: true, error: "", success: false });

    const payload = {
      nome: formData.nome,
      email: formData.email,
      mensagem: formData.mensagem,
      tipoContato: formData.assunto,
      altcha: altchaPayload
    };

    try {
      await api.post("/api/contatos", payload);
      setStatus({ loading: false, error: "", success: true });
      setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
      
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      console.error("Erro na requisição:", error);
      const errorMessage = error.response?.data?.error || "Erro ao enviar mensagem.";
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <section className={styles.page}>
      <style>{`
        altcha-widget {
          --altcha-width: 100%;
          --altcha-border-radius: 0.5rem;
        }
      `}</style>

      <div className="mt-16 mb-10 text-center">
        <h1 className={styles.title}>Central de Ajuda</h1>
        <p className={styles.subtitle}>Tire suas dúvidas e encontre suporte aqui.</p>
      </div>

      <div className={styles.divider}></div>

      <div className="flex justify-center">
        <form onSubmit={handleEnviar} className={styles.card}>
          {status.error && <Alert type="error">{status.error}</Alert>}
          {status.success && (
            <Alert type="success">Mensagem enviada com sucesso!</Alert>
          )}

          {fields.map((campo) => (
            <div key={campo.name}>
              <label className={styles.label}>{campo.label}</label>
              <input
                type={campo.type}
                name={campo.name}
                value={formData[campo.name]}
                onChange={handleAlteracao}
                placeholder={campo.placeholder}
                className={styles.input}
              />
            </div>
          ))}

          <div>
            <label className={styles.label}>Assunto</label>
            <select
              name="assunto"
              value={formData.assunto}
              onChange={handleAlteracao}
              className={styles.input}
            >
              <option value="" disabled>Selecione o tipo de contato</option>
              <option value="DUVIDA">Dúvida</option>
              <option value="CHAMADO">Problema técnico</option>
              <option value="SUGESTAO">Sugestão</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>Mensagem</label>
            <div className="flex flex-col">
              <textarea
                name="mensagem"
                value={formData.mensagem}
                onChange={handleAlteracao}
                rows="4"
                maxLength={message_max}
                placeholder="Descreva sua mensagem"
                className={`${styles.input} pr-16 resize-none`}
              />
              <span className="mt-1 text-xs text-right text-slate-500">
                {formData.mensagem.length} / {message_max}
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-2 pb-2">
            <altcha-widget
              ref={widgetRef}
              challengeurl="http://localhost:8080/api/contatos/challenge"
              hidelogo
              language="pt-br"
            ></altcha-widget>
          </div>

          <button
            type="submit"
            disabled={status.loading || !altchaPayload}
            className={styles.button}
          >
            {status.loading && (
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            )}
            {status.loading ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}