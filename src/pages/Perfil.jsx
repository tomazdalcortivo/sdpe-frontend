import { useState, useEffect } from "react";
import {
  Camera,
  Edit2,
  Trash2,
  Save,
  X,
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Alert } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import defaultImage from "../assets/imagem_perfil.png";
import api from "../services/api";

const styles = {
  page: "min-h-screen px-4 md:px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  container: "max-w-6xl mx-auto",
  card: "relative mb-10 overflow-hidden bg-white rounded-lg shadow",
  sectionCard: "p-8 mb-10 bg-white rounded-lg shadow",
  headerBanner: "h-40 bg-linear-to-r from-emerald-700 to-emerald-500",
  label: "block mb-1 font-medium text-slate-700",
  input: "w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500 transition-all",
  inputSmall: "w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500",
  btnPrimary: "flex items-center gap-2 px-5 py-2 text-white transition-all rounded-md shadow bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
  btnDark: "flex items-center gap-2 px-5 py-2 text-white transition-all rounded-md shadow bg-emerald-900 hover:bg-emerald-700",
  btnDanger: "flex items-center gap-2 px-6 py-2 text-white transition-all bg-red-600 rounded-md shadow hover:bg-red-700",
  btnGhost: "flex items-center gap-2 px-4 py-2 transition-all bg-gray-200 rounded-md hover:bg-gray-300",
  btnOutline: "px-4 py-2 text-sm font-medium text-center transition-colors border rounded-md text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  badge: "px-2 py-0.5 text-xs font-semibold rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function Perfil() {
  const navigate = useNavigate();
  const MESSAGE_MAX = 500;

  const [role, setRole] = useState("PARTICIPANTE");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [projectTab, setProjectTab] = useState("participated");

  const [createdProjects, setCreatedProjects] = useState([]);
  const [participatedProjects, setParticipatedProjects] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [userData, setUserData] = useState({
    id: null,
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    resumo: "",
    fotoPerfil: null,
  });

  const isProfessor = role === "COORDENADOR" || role === "ADMIN";

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
  };

  useEffect(() => {
    api
      .get("/api/localidades/estados")
      .then((res) => setEstados(res.data))
      .catch((err) => console.error("Erro ao carregar estados", err));
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/entrar");
          return;
        }

        const response = await api.get("/auth/perfil");
        const data = response.data;

        setUserData({
          id: data.id,
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          resumo: data.resumo || "",
          fotoPerfil: data.fotoPerfil || null,
        });

        if (data.estado) fetchCidades(data.estado);
        if (data.perfil) {
          setRole(data.perfil);
          if (data.perfil === "COORDENADOR" || data.perfil === "ADMIN")
            setProjectTab("created");
        }

        const [resCriados, resParticipados] = await Promise.all([
          data.perfil === "COORDENADOR" || data.perfil === "ADMIN"
            ? api.get("/api/projetos/meus-criados")
            : { data: [] },
          api.get("/api/projetos/meus-participados"),
        ]);

        setCreatedProjects(resCriados.data);
        setParticipatedProjects(resParticipados.data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, [navigate]);

  const fetchCidades = async (uf) => {
    try {
      const res = await api.get(`/api/localidades/estados/${uf}/cidades`);
      setCidades(res.data);
    } catch (err) {
      console.error("Erro ao buscar cidades", err);
    }
  };

  const handleEstadoChange = (e) => {
    const uf = e.target.value;
    setUserData({ ...userData, estado: uf, cidade: "" });
    if (uf) fetchCidades(uf);
    else setCidades([]);
  };

  const handleTelefoneMask = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/^(\(\d{2}\)\s\d)(\d{4})(\d)/, "$1 $2-$3");
    setUserData((prev) => ({ ...prev, telefone: v }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/participantes/${userData.id}`, userData);
      setIsEditing(false);
      showFeedback("success", "Perfil atualizado com sucesso!");
    } catch (error) {
      showFeedback("error", "Erro ao salvar os dados.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
      )
    ) {
      try {
        await api.delete(`/api/participantes/${userData.id}`);
        localStorage.removeItem("token");
        navigate("/entrar");
      } catch (error) {
        showFeedback("error", "Erro ao excluir conta.");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return showFeedback("error", "A imagem deve ter no máximo 5MB.");

    const formData = new FormData();
    formData.append("file", file);
    try {
      setIsLoading(true);
      const res = await api.patch(
        `/api/participantes/${userData.id}/foto`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setUserData({ ...userData, fotoPerfil: res.data.fotoPerfil });
      showFeedback("success", "Foto atualizada!");
    } catch (error) {
      showFeedback("error", "Erro ao enviar foto.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentProjects =
    projectTab === "created" ? createdProjects : participatedProjects;

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 rounded-full border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
    );

  return (
    <section className={styles.page}>
      {feedback.message && (
        <div className="fixed z-50 w-full max-w-md px-4 -translate-x-1/2 top-24 left-1/2">
          <Alert
            color={feedback.type === "success" ? "success" : "failure"}
            icon={feedback.type === "success" ? HiCheck : HiX}
            onDismiss={() => setFeedback({ type: "", message: "" })}
            rounded
            className="shadow-xl"
          >
            {feedback.message}
          </Alert>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerBanner}></div>
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.btnDark}
              >
                <Edit2 size={16} /> Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className={styles.btnPrimary}>
                  <Save size={16} /> Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.btnGhost}
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="px-8 pb-8">
            <div
              className={`flex flex-col items-end gap-6 mb-6 md:flex-row ${isEditing ? "mt-7" : "-mt-20"}`}
            >
              <div className="relative group">
                <img
                  src={
                    userData.fotoPerfil
                      ? `${userData.fotoPerfil}?t=${Date.now()}`
                      : defaultImage
                  }
                  className="object-cover w-40 h-40 bg-white border-4 border-white rounded-lg shadow"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100">
                    <Camera className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 w-full">
                {!isEditing ? (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{userData.nome}</h2>
                    <span className={styles.badge}>{role}</span>
                  </div>
                ) : (
                  <input
                    className={styles.input}
                    value={userData.nome}
                    onChange={(e) =>
                      setUserData({ ...userData, nome: e.target.value })
                    }
                    placeholder="Nome completo"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 mb-6 md:grid-cols-3 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="text-emerald-600 shrink-0" size={18} />
                <span className="truncate">{userData.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="text-emerald-600 shrink-0" size={18} />
                {!isEditing ? (
                  <span>{userData.telefone || "-"}</span>
                ) : (
                  <input
                    className={styles.inputSmall}
                    value={userData.telefone}
                    onChange={handleTelefoneMask}
                    placeholder="(00) 00000-0000"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-600 shrink-0" size={18} />
                {!isEditing ? (
                  <span>
                    {userData.cidade
                      ? `${userData.cidade} - ${userData.estado}`
                      : "Não informado"}
                  </span>
                ) : (
                  <div className="flex gap-1">
                    <select
                      className={styles.inputSmall}
                      value={userData.estado}
                      onChange={handleEstadoChange}
                    >
                      <option value="">UF</option>
                      {estados.map((est) => (
                        <option key={est.sigla} value={est.sigla}>
                          {est.sigla}
                        </option>
                      ))}
                    </select>
                    <select
                      className={styles.inputSmall}
                      value={userData.cidade}
                      onChange={(e) =>
                        setUserData({ ...userData, cidade: e.target.value })
                      }
                      disabled={!userData.estado}
                    >
                      <option value="">Cidade</option>
                      {cidades.map((cid) => (
                        <option key={cid.id || cid.nome} value={cid.nome}>
                          {cid.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={styles.label}>Resumo:</label>
              {!isEditing ? (
                <p className="block mb-1 text-sm font-medium text-slate-700">
                  {userData.resumo || "Nenhum resumo informado."}
                </p>
              ) : (
                <div className="relative">
                  <textarea
                    className={styles.input}
                    rows="4"
                    maxLength={MESSAGE_MAX}
                    value={userData.resumo}
                    onChange={(e) =>
                      setUserData({ ...userData, resumo: e.target.value })
                    }
                  />
                  <span className="absolute text-xs bottom-2 right-3 text-slate-500">
                    {userData.resumo.length} / {MESSAGE_MAX}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              <Briefcase className="text-emerald-600" /> Meus Projetos
            </h2>
            {isProfessor && !isEditing && (
              <button
                onClick={() => navigate("/criar-projeto")}
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
              >
                + Criar Projeto
              </button>
            )}
          </div>

          <div className="flex gap-3 pb-4 mb-6 border-b border-gray-100">
            {isProfessor && (
              <button
                onClick={() => setProjectTab("created")}
                className={
                  projectTab === "created"
                    ? "px-5 py-2 rounded-md bg-emerald-600 text-white"
                    : "px-5 py-2 rounded-md bg-gray-100"
                }
              >
                Gerenciados ({createdProjects.length})
              </button>
            )}
            <button
              onClick={() => setProjectTab("participated")}
              className={
                projectTab === "participated"
                  ? "px-5 py-2 rounded-md bg-emerald-600 text-white"
                  : "px-5 py-2 rounded-md bg-gray-100"
              }
            >
              Participações ({participatedProjects.length})
            </button>
          </div>

          <ul className="space-y-4">
            {currentProjects.map((projeto) => (
              <li
                key={projeto.id}
                className={`border rounded-lg overflow-hidden ${!projeto.ativo && projeto.motivoRejeicao
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
                  }`}
              >
                {!projeto.ativo && projeto.motivoRejeicao && (
                  <div className="flex items-start gap-3 p-4 border-b border-red-100">
                    <AlertTriangle
                      className="text-red-500 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-xs font-bold text-red-800 uppercase">
                        Necessária Revisão
                      </p>
                      <p className="text-sm text-red-700">
                        {projeto.motivoRejeicao}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-bold">{projeto.nome}</h3>
                    <p className="mb-2 text-sm text-slate-500 line-clamp-1">
                      {projeto.descricao}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      {projeto.dataInicio && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(projeto.dataInicio).toLocaleDateString()}
                        </div>
                      )}
                      {projeto.cargaHoraria && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {projeto.cargaHoraria}h
                        </div>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${projeto.ativo
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}
                      >
                        {projeto.ativo ? "ATIVO" : "PENDENTE/INATIVO"}
                      </span>
                    </div>

                  </div>

                  <Link
                    to={`/detalhes-projeto/${projeto.id}`}
                    className={styles.btnOutline}
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </li>
            ))}
            {currentProjects.length === 0 && (
              <li className="py-8 text-center text-slate-500 border-2 border-dashed rounded-lg">
                Nenhum projeto encontrado.
              </li>
            )}
          </ul>
        </div>

        <div className="flex justify-end">
          <button onClick={handleDeleteAccount} className={styles.btnDanger}>
            <Trash2 size={16} /> Excluir conta
          </button>
        </div>
      </div>
    </section>
  );
}