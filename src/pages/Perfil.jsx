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
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import defaultImage from "../assets/imagem_perfil.png";
import api from "../services/api";

const styles = {
  page: "min-h-screen px-8 pt-40 pb-40 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  container: "max-w-6xl mx-auto",
  card: "relative mb-10 overflow-hidden bg-white rounded-lg shadow",
  sectionCard: "p-8 mb-10 bg-white rounded-lg shadow",
  headerBanner: "h-40 bg-linear-to-r from-emerald-700 to-emerald-500",
  label: "block mb-1 font-medium text-slate-700",
  input:
    "w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500 transition-all",
  inputSmall:
    "w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500",
  btnPrimary:
    "flex items-center gap-2 px-5 py-2 text-white transition-all rounded-md shadow bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
  btnDark:
    "flex items-center gap-2 px-5 py-2 text-white transition-all rounded-md shadow bg-emerald-900 hover:bg-emerald-700",
  btnDanger:
    "flex items-center gap-2 px-6 py-2 text-white transition-all bg-red-600 rounded-md shadow hover:bg-red-700",
  btnGhost:
    "flex items-center gap-2 px-4 py-2 transition-all bg-gray-200 rounded-md hover:bg-gray-300",
  btnOutline:
    "px-4 py-2 text-sm font-medium text-center transition-colors border rounded-md text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  tabActive:
    "px-5 py-2 rounded-md font-medium transition-colors bg-emerald-600 text-white shadow-sm",
  tabInactive:
    "px-5 py-2 rounded-md font-medium transition-colors bg-white text-slate-600 hover:bg-gray-50 border border-gray-200",
  badge: "px-2 py-0.5 text-xs font-semibold rounded-full border",
  badgeSuccess: "bg-emerald-100 text-emerald-800 border-emerald-200",
  projetoCard:
    "p-4 mb-3 transition-all border rounded-lg hover:shadow-md border-slate-200 hover:border-emerald-200 bg-slate-50",
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

  // Carregar Estados
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

        const resCriados =
          data.perfil === "COORDENADOR" || data.perfil === "ADMIN"
            ? await api.get("/api/projetos/meus-criados")
            : { data: [] };
        const resParticipados = await api.get(
          "/api/projetos/meus-participados",
        );

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

  const handleTelefoneMask = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);

    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/^(\(\d{2}\)\s\d)(\d{4})(\d)/, "$1 $2-$3");

    setUserData((prev) => ({ ...prev, telefone: v }));
  };

  const handleEstadoChange = (e) => {
    const uf = e.target.value;
    setUserData({ ...userData, estado: uf, cidade: "" });
    if (uf) fetchCidades(uf);
    else setCidades([]);
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/participantes/${userData.id}`, userData);
      setIsEditing(false);
      alert("Perfil atualizado!");
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    } catch (error) {
      alert("Erro ao enviar foto.");
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
            {/* Foto e Nome */}
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
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      {role}
                    </span>
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

            {/* Informações de Contato e Localização */}
            <div className="grid gap-4 mb-6 md:grid-cols-3 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="text-emerald-600 shrink-0" size={18} />
                <span className="truncate" title={userData.email}>
                  {userData.email || "-"}
                </span>
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
                    placeholder="(00)0 0000-0000"
                  />
                )}
              </div>

              {/* Localização Dinâmica */}
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <MapPin className="text-emerald-600 shrink-0" size={18} />
                  <span>
                    {userData.cidade && userData.estado
                      ? `${userData.cidade} - ${userData.estado}`
                      : "Localização não informada"}
                  </span>
                </div>
              ) : (
                <div className="flex col-span-1 gap-2 md:col-span-1">
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
                      <option key={cid.nome} value={cid.nome}>
                        {cid.nome}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${styles.inputSmall} w-20`}
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
                </div>
              )}
            </div>

            {/* Resumo */}
            <div>
              <label className={styles.label}>Resumo:</label>
              {!isEditing ? (
                <p className="max-w-full break-words break-all whitespace-pre-wrap text-slate-600">
                  {userData.resumo || "Nenhum resumo informado."}
                </p>
              ) : (
                <div className="relative">
                  <textarea
                    className={styles.input}
                    rows="3"
                    maxLength={MESSAGE_MAX}
                    placeholder="Conte um pouco sobre você..."
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

        {/* Seção de Projetos */}
        <div className={styles.sectionCard}>
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-slate-800">
            <Briefcase className="text-emerald-600" /> Meus Projetos
          </h2>
          <div className="flex gap-3 pb-4 mb-6 border-b border-gray-100">
            {isProfessor && (
              <button
                onClick={() => setProjectTab("created")}
                className={
                  projectTab === "created"
                    ? styles.tabActive
                    : styles.tabInactive
                }
              >
                Gerenciados ({createdProjects.length})
              </button>
            )}
            <button
              onClick={() => setProjectTab("participated")}
              className={
                projectTab === "participated"
                  ? styles.tabActive
                  : styles.tabInactive
              }
            >
              Participações ({participatedProjects.length})
            </button>
          </div>

          {currentProjects.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              Nenhum projeto encontrado.
            </p>
          ) : (
            <ul className="space-y-3">
              {currentProjects.map((projeto) => (
                <li key={projeto.id} className={styles.projetoCard}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {projeto.nome}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {projeto.descricao}
                      </p>
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
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
