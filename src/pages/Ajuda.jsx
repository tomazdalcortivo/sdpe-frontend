import { useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert";

const message_max = 500;

{
  /* PADROES DE ESTILO */
}
const styles = {
  page: "min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  title:
    "mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text",
  subtitle: "max-w-2xl mx-auto text-xl text-slate-600",
  divider: "h-px mx-auto my-10 bg-gray-300 w-lg",
  card: "w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg",
  label: "block mb-1 text-sm font-medium text-slate-700",
  input:
    "w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  button:
    "flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed",
};


const fields = [
  {
    name: "nome",
    label: "Nome Completo",
    type: "text",
    placeholder: "Seu nome completo",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "usuario@email.com",
  },
];

export default function Ajuda() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "Selecione",
    mensagem: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
  });

  /* ===== LÓGICA (INTOCADA) ===== */
  const handleAlteracao = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoAssunto = (assunto) => {
    if (assunto === "Sugestão") return "FEEDBACK";
    return "CHAMADO";
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    if (
      formData.subject === "Selecione" ||
      !formData.mensagem ||
      !formData.email ||
      !formData.nome
    ) {
      setStatus({
        loading: false,
        error: "Por favor, preencha todos os fields.",
        success: false,
      });
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      mensagem: formData.mensagem,
      tipoContato: handleTipoAssunto(formData.assunto),
      projeto: null,
    };

    try {
      await api.post("/api/contatos", payload);
      setStatus({ loading: false, error: "", success: true });
      setFormData({
        nome: "",
        email: "",
        assunto: "Selecione",
        mensagem: "",
      });

      setTimeout(() => {
        setStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro de conexão com o servidor.";
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <section className={styles.page}>
      {/* Cabeçalho */}
      <div className="mt-16 mb-10 text-center">
        <h1 className={styles.title}>Central de Ajuda</h1>
        <p className={styles.subtitle}>
          Tire suas dúvidas e encontre suporte aqui.
        </p>
      </div>

      <div className={styles.divider}></div>

      {/* Formulário */}
      <div className="flex justify-center">
        <form onSubmit={handleEnviar} className={styles.card}>
          <Alert type="error">{status.error}</Alert>

          {status.success && (
            <Alert type="success">
              Mensagem enviada com sucesso! Entraremos em contato em breve.
            </Alert>
          )}

          {/* Inputs mapeados */}
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

          {/* Assunto */}
          <div>
            <label className={styles.label}>Assunto</label>
            <select
              name="assunto"
              value={formData.assunto}
              onChange={handleAlteracao}
              className={styles.input}
            >
              <option value="Selecione" disabled>
                Selecione
              </option>
              <option>Dúvida</option>
              <option>Problema técnico</option>
              <option>Sugestão</option>
              <option>Outro</option>
            </select>
          </div>

          {/* Mensagem */}
          <div>
            <label className={styles.label}>Mensagem</label>

            <div className="relative">
              <textarea
                name="mensagem"
                value={formData.mensagem}
                onChange={handleAlteracao}
                rows="4"
                maxLength={message_max}
                placeholder="Descreva sua mensagem"
                className={`${styles.input} pr-16`}
              />

              <span className="absolute text-xs bottom-2 right-3 text-slate-500">
                {formData.mensagem.length} / {message_max}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={status.loading}
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
