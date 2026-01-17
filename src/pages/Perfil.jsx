import { useState, useEffect } from "react";
import { Camera, Edit2, Trash2, Save, X, Briefcase, Mail, MapPin, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../assets/imagem_perfil.png";
import api from "../services/api";

export default function Perfil() {
  const navigate = useNavigate();

  const [role, setRole] = useState("PARTICIPANTE");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [projectTab, setProjectTab] = useState("created");

  const [userData, setUserData] = useState({
    id: null,
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    resumo: "",
    fotoPerfil: null,
  });

  const isProfessor = role === "COORDENADOR" || role === "ADMIN";

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
          resumo: data.resumo || "",
          fotoPerfil: data.fotoPerfil || null,
        });

        if (data.perfil) setRole(data.perfil);

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/entrar");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    try {
      await api.put(`/api/participantes/${userData.id}`, {
        nome: userData.nome,
        telefone: userData.telefone,
        cidade: userData.cidade,
        resumo: userData.resumo
      });
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!"); // Feedback visual

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar dados.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.")) {
      try {
        await api.delete(`/api/participantes/${userData.id}`);
        localStorage.removeItem("token");
        navigate("/entrar");
      } catch (error) {
        alert("Erro ao excluir conta.");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);

      const response = await api.patch(`/api/participantes/${userData.id}/foto`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData({ ...userData, fotoPerfil: response.data.fotoPerfil });
      alert("Foto atualizada com sucesso!");

    } catch (error) {
      console.error("Erro ao enviar imagem", error);
      alert("Erro ao enviar a foto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const createdProjects = [];
  const participatedProjects = [];
  const currentProjects = projectTab === "created" ? createdProjects : participatedProjects;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 rounded-full border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="max-w-6xl mx-auto">

        {/* Card do perfil */}
        <div className="relative mb-10 overflow-hidden bg-white rounded-lg shadow">
          <div className="h-40 bg-linear-to-r from-emerald-700 to-emerald-500"></div>

          {/* Botão Editar/Salvar */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2 text-white transition-colors rounded-md shadow bg-emerald-900 hover:bg-emerald-700"
              >
                <Edit2 size={16} />
                Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save size={16} />
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="px-8 pb-8">
            {/* Foto e Nome */}
            <div className={`flex flex-col items-end gap-6 mb-6 -mt-20 md:flex-row ${isEditing ? "mt-7" : "-mt-20"}`}>
              <div className="relative group">
                <img
                  // Garante cache busting com ?t=... e fallback para imagem padrão
                  src={userData.fotoPerfil ? `${userData.fotoPerfil}?t=${Date.now()}` : defaultImage}
                  alt="Perfil"
                  className="object-cover w-40 h-40 bg-white border-4 border-white rounded-lg shadow"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem na tela:", e.target.src);
                    e.target.src = defaultImage;
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100">
                    <Camera className="text-white" />
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                {!isEditing ? (
                  <>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{userData.nome}</h2>
                      <span className="px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200">
                        {role}
                      </span>
                    </div>
                  </>
                ) : (
                  <input
                    className="w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500"
                    placeholder="Nome completo"
                    value={userData.nome}
                    onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* INFO: Email, Telefone e Cidade */}
            <div className="grid gap-4 mb-6 md:grid-cols-3 text-slate-600">

              <div className="flex items-center gap-2">
                <Mail className="text-emerald-600 shrink-0" size={18} />
                <span className="truncate" title={userData.email}>{userData.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="text-emerald-600 shrink-0" size={18} />
                {!isEditing ? (
                  <span>{userData.telefone || "-"}</span>
                ) : (
                  <input
                    className="w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500"
                    placeholder="Telefone"
                    value={userData.telefone}
                    onChange={(e) => setUserData({ ...userData, telefone: e.target.value })}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-600 shrink-0" size={18} />
                {!isEditing ? (
                  <span>{userData.cidade || "-"}</span>
                ) : (
                  <input
                    className="w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500"
                    placeholder="Cidade"
                    value={userData.cidade}
                    onChange={(e) => setUserData({ ...userData, cidade: e.target.value })}
                  />
                )}
              </div>
            </div>

            {/* RESUMO */}
            <div>
              <label className="block mb-1 font-medium text-slate-700">Resumo:</label>
              {!isEditing ? (
                <p className="whitespace-pre-wrap text-slate-600">
                  {userData.resumo || "Nenhum resumo informado."}
                </p>
              ) : (
                <textarea
                  className="w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500"
                  rows="3"
                  placeholder="Escreva um breve resumo sobre você..."
                  value={userData.resumo}
                  onChange={(e) => setUserData({ ...userData, resumo: e.target.value })}
                />
              )}
            </div>

            {/* Botão Criar Projeto */}
            {isProfessor && !isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => navigate("/CriarProjeto")}
                  className="px-6 py-2 text-sm font-medium text-white transition rounded-md shadow bg-emerald-600 hover:bg-emerald-700"
                >
                  + Criar novo projeto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meus Projetos */}
        <div className="p-8 mb-10 bg-white rounded-lg shadow">
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-slate-800">
            <Briefcase className="text-emerald-600" />
            Meus Projetos
          </h2>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setProjectTab("created")}
              className={`px-5 py-2 rounded-md font-medium transition-colors ${projectTab === "created" ? "bg-emerald-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
            >
              Criados
            </button>
            
            <button
              onClick={() => setProjectTab("participated")}
              className={`px-5 py-2 rounded-md font-medium transition-colors ${projectTab === "participated" ? "bg-emerald-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
            >
              Participados
            </button>

            <button
              onClick={() => setProjectTab("analise")}
              className={`px-5 py-2 rounded-md font-medium transition-colors ${projectTab === "analise" ? "bg-emerald-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
            >
              Em análise
            </button>
          </div>

          {currentProjects.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed rounded-lg border-slate-200">
              <p className="text-slate-500">Nenhum projeto encontrado.</p>
            </div>
          ) : (
            <ul>{/* Lista de projetos */}</ul>
          )}
        </div>

        {/* Excluir conta */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-red-600 rounded-md shadow hover:bg-red-700">
            <Trash2 size={16} />
            Excluir conta
          </button>
        </div>
      </div>
    </section>
  );
}