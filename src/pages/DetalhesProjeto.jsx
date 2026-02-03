import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  Users,
  Target,
  BookOpen,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Upload,
  X,
  FileText,
  ImageIcon,
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Trash2,
  Search,
  UserPlus,
  Send,
  LaptopMinimalCheck,
} from "lucide-react";
import defaultImage from "../assets/capa-padrao-projeto.png";
import api, { getLoggedUser } from "../services/api";

export default function DetalhesProjeto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [novaImagem, setNovaImagem] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberType, setMemberType] = useState("participante");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const viewRecorded = useRef(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    area: "",
    startDate: "",
    endDate: "",
    workload: "",
    format: "",
    planning: "",
    instCidade: "",
    instEstado: "",
    participants: [],
    socialMedia: {
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    images: [],
    videos: [],
    documents: [],
  });

  const baseURL =
    api && api.defaults && api.defaults.baseURL
      ? api.defaults.baseURL
      : "http://localhost:8080";
  const getImageUrl = (id) => `${baseURL}/api/projetos/${id}/imagem`;

  const handleBack = () => {
    navigate(-1);
  };

  const formatarData = (dataString) => {
    if (!dataString) return "Data não informada";
    try {
      const dataApenas = dataString.split("T")[0];
      const partes = dataApenas.split("-");
      if (partes.length !== 3) return dataString;
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    } catch (e) {
      return dataString;
    }
  };

  useEffect(() => {
    async function carregarTudo() {
      try {
        setLoading(true); // Garante que o loading comece

        // 1. Carrega os estados para os selects
        const resEstados = await api.get("/api/localidades/estados");
        setEstados(resEstados.data);

        await fetchProject();
      } catch (e) {
        console.error("Erro ao carregar dados iniciais", e);
        setError("Falha ao carregar o projeto.");
      } finally {
        setLoading(false);
      }
    }

    carregarTudo();
    registerView(); // Registra a visualização
  }, [id]);

  const handleEstadoChange = async (e) => {
    const estadoSelecionado = e.target.value;

    setEditData((prev) => ({
      ...prev,
      instEstado: estadoSelecionado,
      instCidade: "",
    }));

    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }

    try {
      const res = await api.get(
        `/api/localidades/estados/${estadoSelecionado}/cidades`,
      );
      setCidades(res.data);
    } catch (e) {
      console.error("Erro ao carregar cidades", e);
    }
  };

  const registerView = async () => {
    if (viewRecorded.current) return;

    try {
      viewRecorded.current = true;
      await api.post(`/api/projetos/${id}/visualizacao`);
    } catch (error) {
      console.error("Erro ao registrar visualização", error);
    }
  };

  async function fetchProject() {
    try {
      setLoading(true);
      const response = await api.get(`/api/projetos/${id}`);
      const data = response.data;

      setProject(response.data);

      setPosts(data.posts || []);

      const user = getLoggedUser();
      const email = user?.sub;

      const owner = data.coordenadores?.some((c) => c.conta?.email === email);

      setIsOwner(owner);

      setEditData({
        title: response.data.nome || "",
        description: response.data.descricao || "",
        area: response.data.area || "",
        startDate: data.dataInicio ? data.dataInicio.split("T")[0] : "",
        endDate: data.dataFim ? data.dataFim.split("T")[0] : "",
        workload: data.cargaHoraria ? String(data.cargaHoraria) : "",
        format: data.formato,
        instNome: data.instituicaoEnsino?.nome || "",
        instCidade: data.instituicaoEnsino?.cidade || "",
        instEstado: data.instituicaoEnsino?.estado || "",
        planning: "",
        participants: data.participantes || [],
        socialMedia: {
          website: data.redesSociais?.website || "",
          facebook: data.redesSociais?.facebook || "",
          instagram: data.redesSociais?.instagram || "",
          linkedin: data.redesSociais?.linkedin || "",
          youtube: data.redesSociais?.youtube || "",
        },
        images: [],
        videos: [],
        documents: [],
      });
    } catch (err) {
      console.error("Erro ao buscar projeto:", err);
      setError("Não foi possível carregar o projeto.");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      let response;
      if (memberType === "participante") {
        response = await api.get(
          `/api/participantes/buscar?nome=${searchTerm}`,
        );
        setSearchResults(
          Array.isArray(response.data) ? response.data : [response.data],
        );
      } else {
        try {
          response = await api.get(`/api/coordenadores/nome/${searchTerm}`);
          setSearchResults(response.data ? [response.data] : []);
        } catch (e) {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("conteudo", newPostContent);
      if (newPostFile) formData.append("arquivo", newPostFile);

      await api.post(`/api/projetos/${id}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post criado!");
      setNewPostContent("");
      setNewPostFile(null);
      fetchProject();
    } catch (err) {
      console.error("Erro ao postar", err);
      alert("Erro ao criar post");
    }
  };

  const handleAddMember = async (memberId) => {
    try {
      const endpoint =
        memberType === "participante"
          ? `/api/projetos/${id}/participantes/${memberId}`
          : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.post(endpoint);

      alert(
        `${memberType === "participante" ? "Participante" : "Coordenador"} adicionado com sucesso!`,
      );
      setShowMemberModal(false);
      fetchProject();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
      alert(
        "Erro ao adicionar membro. Verifique se ele já não faz parte do projeto.",
      );
    }
  };

  const handleRemoveMember = async (memberId, type) => {
    if (!window.confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      const endpoint =
        type === "participante"
          ? `/api/projetos/${id}/participantes/${memberId}`
          : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.delete(endpoint);
      fetchProject();
    } catch (err) {
      console.error("Erro ao remover:", err);
      alert("Erro ao remover membro.");
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Montando o objeto exatamente como o Backend espera
      const projetoPayload = {
        nome: editData.title,
        descricao: editData.description,
        area: editData.area,
        // Corrigido: usando editData em vez de data
        dataInicio: editData.startDate ? new Date(editData.startDate) : null,
        dataFim: editData.endDate ? new Date(editData.endDate) : null,
        cargaHoraria: editData.workload ? parseFloat(editData.workload) : null,
        formato: editData.format?.toUpperCase(),
        redesSociais: editData.socialMedia,
        instituicaoEnsino: {
          nome: editData.instNome,
          cidade: editData.instCidade,
          estado: editData.instEstado,
        },
      };

      formData.append(
        "projeto",
        new Blob([JSON.stringify(projetoPayload)], {
          type: "application/json",
        }),
      );

      if (novaImagem) {
        formData.append("arquivo", novaImagem);
      }

      await api.put(`/api/projetos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Projeto atualizado com sucesso!");

      setNovaImagem(null);
      setIsEditing(false);
      fetchProject();
    } catch (err) {
      console.error("Erro detalhado:", err.response?.data || err);
      alert("Erro ao atualizar o projeto. Verifique o console.");
    }
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (files && editData.documents.length < 10) {
      const newDocs = Array.from(files)
        .slice(0, 10 - editData.documents.length)
        .map((f) => f.name);
      setEditData({
        ...editData,
        documents: [...editData.documents, ...newDocs],
      });
    }
  };

  const removeItem = (type, index) => {
    setEditData({
      ...editData,
      [type]: editData[type].filter((_, i) => i !== index),
    });
  };

  if (loading) return <p className="p-10">Carregando...</p>;

  if (error || !project)
    return (
      <div className="p-10 text-center">
        <p>{error || "Projeto não encontrado"}</p>
        <button onClick={handleBack} className="mt-4 text-emerald-600">
          Voltar
        </button>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 text-gray-600 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="mb-8 overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="relative overflow-hidden h-80">
            <img
              src={
                novaImagem
                  ? URL.createObjectURL(novaImagem)
                  : getImageUrl(project.id)
              }
              alt={project.nome || project.title}
              onError={(e) => {
                e.target.src = defaultImage;
              }}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              {isEditing ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 px-4 py-2 transition-all border rounded-lg cursor-pointer w-fit bg-black/40 hover:bg-black/60 backdrop-blur-sm border-white/20">
                    <Upload className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">
                      Alterar Capa
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && setNovaImagem(e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 text-3xl font-bold text-white rounded-lg md:text-4xl bg-white/20 backdrop-blur-sm"
                  />
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 text-sm font-semibold text-white rounded-full bg-emerald-600">
                      {project.area || project.category}
                    </span>
                    <span className="text-sm opacity-90">
                      {project.status === false ? "Inativo" : "Em andamento"}
                    </span>
                    <span className="px-2 py-1 text-sm border rounded opacity-90 border-white/30">
                      {project.formato || editData.format}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold md:text-4xl">
                    {project.nome || project.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-4 py-1 text-sm font-semibold text-white rounded-full bg-emerald-600">
                      {project.area || project.category}
                    </span>
                    <span className="text-sm opacity-90">
                      {project.status === false ? "Inativo" : "Em andamento"}
                    </span>
                    <span className="px-2 py-1 text-sm border rounded opacity-90 border-white/30">
                      {project.formato || editData.format}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${isEditing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg"}`}
              >
                <Edit2 className="w-5 h-5" />
                {isEditing ? "Cancelar Edição" : "Editar Projeto"}
              </button>
            </div>
          )}

          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === "overview" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300"}`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === "feed" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-emerald-600"}`}
              >
                Feed de Notícias
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === "documents" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300"}`}
              >
                Editais
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === "feedback" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300"}`}
              >
                Feedback
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {activeTab === "overview" && (
              <>
                <div>
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                    Descrição
                  </h2>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="leading-relaxed text-gray-600">
                      {project.descricao || project.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Target className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Área de Aplicação
                        </h3>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.area}
                            onChange={(e) =>
                              setEditData({ ...editData, area: e.target.value })
                            }
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        ) : (
                          <p className="text-gray-600">
                            {project.area || project.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Período</h3>
                        {isEditing ? (
                          <div className="mt-1 space-y-2">
                            <input
                              type="date"
                              value={editData.startDate}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  startDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <input
                              type="date"
                              value={editData.endDate}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  endDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            {formatarData(project.dataInicio)} -{" "}
                            {formatarData(project.dataFim)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Carga Horária
                        </h3>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.workload}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                workload: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        ) : (
                          <p className="text-gray-600">
                            {project.cargaHoraria || editData.workload} horas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <LaptopMinimalCheck className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Formato</h3>
                        {isEditing ? (
                          <select
                            value={editData.format}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                format: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option>Presencial</option>
                            <option>Remoto</option>
                            <option>Híbrido</option>
                          </select>
                        ) : (
                          <p className="text-gray-600">
                            {project.formato || editData.format}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Participantes
                        </h3>
                        <p className="text-gray-600">
                          {(project.participantes &&
                            project.participantes.length) ||
                            editData.participants.length}{" "}
                          membros ativos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Instituição de Ensino
                      </h3>

                      {isEditing ? (
                        <div className="flex flex-col gap-2 mt-1">
                          {/* Nome da Instituição */}
                          <input
                            type="text"
                            placeholder="Nome da Instituição"
                            value={editData.instNome}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                instNome: e.target.value.toUpperCase(),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />

                          <div className="flex gap-2">
                            {/* Seleção de Estado (UF) */}
                            <select
                              value={editData.instEstado}
                              onChange={handleEstadoChange} // Usa a função robusta com fetch
                              className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">UF</option>
                              {estados.map((e) => (
                                <option key={e.sigla} value={e.sigla}>
                                  {e.sigla}
                                </option>
                              ))}
                            </select>

                            {/* Seleção de Cidade */}
                            <select
                              value={editData.instCidade}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  instCidade: e.target.value,
                                }))
                              }
                              disabled={!editData.instEstado}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
                            >
                              <option value="">Selecione a Cidade</option>
                              {cidades.map((c) => (
                                <option key={c.nome} value={c.nome}>
                                  {c.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        /* Modo Visualização */
                        <p className="text-gray-600">
                          {project.instituicaoEnsino
                            ? `${project.instituicaoEnsino.nome} - ${project.instituicaoEnsino.cidade}/${project.instituicaoEnsino.estado}`
                            : "Não informada"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Equipe do Projeto
                    </h2>
                    {isOwner && isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMemberType("participante");
                            setShowMemberModal(true);
                            setSearchResults([]);
                            setSearchTerm("");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium"
                        >
                          <UserPlus className="w-4 h-4" /> Add Participante
                        </button>
                        <button
                          onClick={() => {
                            setMemberType("coordenador");
                            setShowMemberModal(true);
                            setSearchResults([]);
                            setSearchTerm("");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                        >
                          <UserPlus className="w-4 h-4" /> Add Coordenador
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Coordenadores
                  </h3>
                  <div className="mb-6 space-y-2">
                    {(project.coordenadores || []).map((coord) => (
                      <div
                        key={coord.id}
                        className="flex items-center justify-between p-3 border border-blue-100 rounded-lg bg-blue-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-blue-600 rounded-full">
                            {(coord.nome || "C").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {coord.nome}
                            </p>
                            <p className="text-xs text-blue-600">
                              {coord.funcao || "Coordenador"}
                            </p>
                          </div>
                        </div>
                        {isOwner && isEditing && (
                          <button
                            onClick={() =>
                              handleRemoveMember(coord.id, "coordenador")
                            }
                            className="p-2 text-red-500 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Participantes
                  </h3>
                  <div className="space-y-2">
                    {(project.participantes || []).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-emerald-600">
                            {(member.nome || "P").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {member.nome}
                            </p>
                            <p className="text-sm text-gray-600">
                              Participante
                            </p>
                          </div>
                        </div>
                        {isOwner && isEditing && (
                          <button
                            onClick={() =>
                              handleRemoveMember(member.id, "participante")
                            }
                            className="p-2 text-red-500 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!project.participantes ||
                      project.participantes.length === 0) && (
                      <p className="text-sm italic text-gray-500">
                        Nenhum participante registrado.
                      </p>
                    )}
                  </div>
                </div>

                {!isEditing &&
                  project.redesSociais &&
                  Object.values(project.redesSociais).some((url) => url) && (
                    <div className="pt-6 mt-8 border-t border-gray-200">
                      <h2 className="mb-4 text-2xl font-bold text-gray-900">
                        Acompanhe nas Redes
                      </h2>
                      <div className="flex flex-wrap gap-4">
                        {project.redesSociais.website && (
                          <a
                            href={project.redesSociais.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-full hover:bg-emerald-100 hover:text-emerald-700"
                          >
                            <Globe className="w-5 h-5" /> Website
                          </a>
                        )}
                        {project.redesSociais.facebook && (
                          <a
                            href={project.redesSociais.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 font-medium text-blue-600 transition-colors rounded-full bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Facebook className="w-5 h-5" /> Facebook
                          </a>
                        )}
                        {project.redesSociais.instagram && (
                          <a
                            href={project.redesSociais.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 font-medium text-pink-600 transition-colors rounded-full bg-pink-50 hover:bg-pink-100 hover:text-pink-700"
                          >
                            <Instagram className="w-5 h-5" /> Instagram
                          </a>
                        )}
                        {project.redesSociais.linkedin && (
                          <a
                            href={project.redesSociais.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 font-medium text-blue-700 transition-colors rounded-full bg-blue-50 hover:bg-blue-100 hover:text-blue-800"
                          >
                            <Linkedin className="w-5 h-5" /> LinkedIn
                          </a>
                        )}
                        {project.redesSociais.youtube && (
                          <a
                            href={project.redesSociais.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 font-medium text-red-600 transition-colors rounded-full bg-red-50 hover:bg-red-100 hover:text-red-700"
                          >
                            <Youtube className="w-5 h-5" /> YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                {isEditing && (
                  <div className="pt-8 border-t border-gray-200">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                      Redes Sociais
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          placeholder="Website"
                          value={editData.socialMedia.website}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              socialMedia: {
                                ...editData.socialMedia,
                                website: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <input
                          type="url"
                          placeholder="Facebook"
                          value={editData.socialMedia.facebook}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              socialMedia: {
                                ...editData.socialMedia,
                                facebook: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-pink-600" />
                        <input
                          type="url"
                          placeholder="Instagram"
                          value={editData.socialMedia.instagram}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              socialMedia: {
                                ...editData.socialMedia,
                                instagram: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <input
                          type="url"
                          placeholder="LinkedIn"
                          value={editData.socialMedia.linkedin}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              socialMedia: {
                                ...editData.socialMedia,
                                linkedin: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-3 md:col-span-2">
                        <Youtube className="w-5 h-5 text-red-600" />
                        <input
                          type="url"
                          placeholder="YouTube"
                          value={editData.socialMedia.youtube}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              socialMedia: {
                                ...editData.socialMedia,
                                youtube: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-8 border-t border-gray-200">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                      Documentos e Editais{" "}
                      <span className="text-sm text-gray-500">
                        (máx. 10 arquivos, 10MB cada)
                      </span>
                    </h2>
                    <div className="space-y-4">
                      <label className="flex items-center justify-center w-full gap-2 p-6 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-emerald-500">
                        <FileText className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600">
                          Adicionar Documentos (PDF, DOC, DOCX)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          multiple
                          onChange={handleDocumentUpload}
                          className="hidden"
                          disabled={editData.documents.length >= 10}
                        />
                      </label>
                      <div className="space-y-2">
                        {editData.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm text-gray-700">
                                {doc}
                              </span>
                            </div>
                            <button
                              onClick={() => removeItem("documents", idx)}
                              className="p-1 text-red-500 rounded hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-8 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="w-full px-8 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-md md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}

                {showMemberModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl">
                      <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900">
                          Adicionar{" "}
                          {memberType === "participante"
                            ? "Participante"
                            : "Coordenador"}
                        </h3>
                        <button
                          onClick={() => setShowMemberModal(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-6">
                        <div className="flex gap-2 mb-6">
                          <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearch()
                            }
                          />
                          <button
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {searchLoading ? (
                              "..."
                            ) : (
                              <Search className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="space-y-2 overflow-y-auto max-h-60">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                            >
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {user.nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email || user.cpf || "Sem contato"}
                                </p>
                              </div>
                              <button
                                onClick={() => handleAddMember(user.id)}
                                className="p-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {searchResults.length === 0 &&
                            !searchLoading &&
                            searchTerm && (
                              <p className="text-center text-gray-500">
                                Nenhum usuário encontrado.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "feed" && (
              <div className="max-w-3xl mx-auto space-y-8">
                {isOwner && (
                  <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <h3 className="mb-4 font-bold text-gray-700">
                      Criar nova publicação
                    </h3>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="O que há de novo no projeto?"
                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-emerald-600">
                        <ImageIcon className="w-5 h-5" />
                        <span>Adicionar Mídia</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setNewPostFile(e.target.files[0])}
                        />
                      </label>
                      {newPostFile && (
                        <span className="text-xs text-emerald-600 truncate max-w-[150px]">
                          {newPostFile.name}
                        </span>
                      )}

                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="flex items-center gap-2 px-6 py-2 text-white rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" /> Publicar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl"
                      >
                        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-emerald-600">
                            {post.autor?.nome?.slice(0, 2).toUpperCase() ||
                              "AD"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {post.autor?.nome || "Coordenador"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                post.dataPublicacao,
                              ).toLocaleDateString()}{" "}
                              às{" "}
                              {new Date(post.dataPublicacao)
                                .toLocaleTimeString()
                                .slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {post.conteudo}
                        </div>

                        {post.mediaUrl && (
                          <div className="w-full bg-gray-100">
                            <img
                              src={post.mediaUrl}
                              alt="Mídia"
                              className="w-full max-h-[500px] object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-500 border border-gray-300 border-dashed bg-gray-50 rounded-xl">
                      <p>Ainda não há publicações neste feed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  Documentos e Editais
                </h2>
                {project.documentos && project.documentos.length > 0 ? (
                  <div className="space-y-3">
                    {project.documentos.map((d, i) => (
                      <a
                        key={i}
                        href={d.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 transition-colors rounded-lg bg-gray-50 hover:bg-emerald-50 group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-gray-700 group-hover:text-emerald-700">
                            {d.nome || d}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-emerald-600">
                          Download
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-lg bg-gray-50">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">
                      Nenhum documento disponível no momento
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="space-y-8">
                <div>
                  <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                    Conversas Públicas
                  </h2>
                  <div className="space-y-4">
                    {(project.comentarios || []).map((c, i) => (
                      <div key={i} className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-bold text-white rounded-full bg-emerald-600">
                            {(c.autor || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {c.autor || "Usuário"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {c.tempo || ""}
                              </span>
                            </div>
                            <p className="text-gray-700">{c.texto || c}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 border-2 border-gray-200 rounded-lg">
                      <textarea
                        placeholder="Deixe seu comentário ou pergunta..."
                        rows={4}
                        className="w-full text-gray-700 border-0 resize-none focus:outline-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button className="px-6 py-2 font-semibold text-white rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500">
                          Enviar Comentário
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Como Ingressar no Projeto
                  </h2>
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-orange-50 rounded-xl md:p-8">
                    <p className="mb-6 leading-relaxed text-gray-700">
                      Interessado em participar deste projeto? Entre em contato
                      com nossa equipe para mais informações sobre vagas
                      disponíveis, requisitos e processo seletivo.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <Mail className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-900">E-mail</p>
                          <a
                            href="mailto:contato@projeto.edu.br"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            contato@projeto.edu.br
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <Phone className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Telefone
                          </p>
                          <a
                            href="tel:+5511999999999"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            (11) 99999-9999
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <Users className="flex-shrink-0 w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Coordenador
                          </p>
                          <p className="text-gray-700">Dr. João Silva</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="w-full px-8 py-3 font-semibold text-white rounded-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600">
                        Enviar Mensagem
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
