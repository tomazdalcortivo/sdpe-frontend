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
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Plus,
  Trash2,
  Search,
  UserPlus,
  Send,
  Check,
  User,
  Laptop,
  ArrowRight,
  Phone,
} from "lucide-react";
import Swal from "sweetalert2";
import defaultImage from "../assets/capa-padrao-projeto.png";
import api, { getLoggedUser } from "../services/api";

export default function DetalhesProjeto() {
  const FORMATO_MAP = {
    PRESENCIAL: "Presencial",
    REMOTO: "Remoto",
    HIBRIDO: "Híbrido",
  };

  const MAX_CHAR = 500;

  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [novaImagem, setNovaImagem] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [isParticipant, setIsParticipant] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);

  const [comentarios, setFeedbacks] = useState([]);
  const [novoComentario, setNewComment] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberType, setMemberType] = useState("participante");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const viewRecorded = useRef(false);
  const coordenadorPrincipal = project?.coordenadores?.[0];


  const [editData, setEditData] = useState({
    title: "",
    description: "",
    area: "",
    startDate: "",
    endDate: "",
    workload: "",
    format: "Presencial",
    participants: [],
    socialMedia: {
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    instNome: "",
    instCidade: "",
    instEstado: "",
    novosDocumentos: [],
  });

  const baseURL =
    api && api.defaults && api.defaults.baseURL
      ? api.defaults.baseURL
      : "http://localhost:8080";
  const getImageUrl = (id) => `${baseURL}/api/projetos/${id}/imagem`;

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    async function loadAllData() {
      if (id) {
        // setLoading(true);
        try {
          try {
            const resEstados = await api.get("/api/localidades/estados");
            setEstados(resEstados.data);
          } catch (e) {
            console.warn("API de Localidades instável ou fora do ar:", e);
            setEstados([]);
          }

          await fetchProject();
          await fetchFeedbacks();
          registerView();
        } catch (e) {
          console.error("Erro ao carregar dados:", e);
        } finally {
          setLoading(false);
        }
      }
    }
    loadAllData();
  }, [id]);

  useEffect(() => {
    async function carregarCidades() {
      if (isEditing && editData.instEstado) {
        try {
          const res = await api.get(
            `/api/localidades/estados/${editData.instEstado}/cidades`,
          );
          setCidades(res.data);
        } catch (e) {
          console.error("Erro ao carregar cidades", e);
          setCidades([]);
        }
      } else if (!editData.instEstado) {
        setCidades([]);
      }
    }
    carregarCidades();
  }, [editData.instEstado, isEditing]);

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
      // setLoading(true);
      const response = await api.get(`/api/projetos/${id}`);
      const data = response.data;

      setProject(response.data);
      setPosts(data.posts || []);

      const user = getLoggedUser();
      const currentUserEmail = user?.sub;

      const owner = data.coordenadores?.some((c) => c.conta?.email === currentUserEmail);
      setIsOwner(owner);

      const foundParticipant = data.participantes?.find(
        (p) => p.conta?.email === currentUserEmail
      );

      if (foundParticipant) {
        setIsParticipant(true);
        setNewComment(prev => ({
          ...prev,
          nome: foundParticipant.nome,
          email: currentUserEmail
        }));
      } else {
        setIsParticipant(false);
      }

      setEditData({
        title: response.data.nome || "",
        description: response.data.descricao || "",
        area: response.data.area || "",
        startDate: data.dataInicio ? data.dataInicio.split("T")[0] : "",
        endDate: data.dataFim ? data.dataFim.split("T")[0] : "",
        workload: data.cargaHoraria ? String(data.cargaHoraria) : "",
        format: data.formato || "Presencial",
        instNome: data.instituicaoEnsino?.nome || "",
        instCidade: data.instituicaoEnsino?.cidade || "",
        instEstado: data.instituicaoEnsino?.estado || "",
        participants: data.participantes || [],
        socialMedia: {
          website: data.redesSociais?.website || "",
          facebook: data.redesSociais?.facebook || "",
          instagram: data.redesSociais?.instagram || "",
          linkedin: data.redesSociais?.linkedin || "",
          youtube: data.redesSociais?.youtube || "",
        },
        novosDocumentos: [],
      });
    } catch (err) {
      console.error("Erro ao buscar projeto:", err);
      setError("Não foi possível carregar o projeto.");
    } finally {
      // setLoading(false);
    }
  }

  async function fetchFeedbacks() {
    try {
      setLoadingComentarios(true);

      const res = await api.get(`/api/projetos/${id}/feedbacks`);

      if (Array.isArray(res.data)) {
        setFeedbacks(res.data);
      } else {
        console.warn("Formato de resposta inesperado:", res.data);
        setFeedbacks([]);
      }
    } catch (error) {
      console.error("Erro ao carregar feedbacks:", error);
    } finally {
      setLoadingComentarios(false);
    }
  }

  async function HandlerSendFeedback(e) {
    e.preventDefault();
    if (!novoComentario.mensagem.trim()) return;

    try {
      const response = await api.post(`/api/projetos/${id}/feedbacks`, {
        nome: novoComentario.nome,
        email: novoComentario.email,
        mensagem: novoComentario.mensagem,
        tipoContato: "FEEDBACK",
      });

      console.log("Feedback enviado:", response.data);

      setNewComment((prev) => ({ ...prev, mensagem: "" }));

      Swal.fire({
        title: "Sucesso!",
        text: "Feedback enviado com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchFeedbacks();
    } catch (error) {
      console.error("Erro detalhado no envio:", error);
      if (error.response && error.response.status === 201) {
        fetchFeedbacks();
        setNewComment((prev) => ({ ...prev, mensagem: "" }));
        Swal.fire("Sucesso!", "Feedback enviado.", "success");
      } else {
        Swal.fire("Erro", "Não foi possível enviar o feedback.", "error");
      }
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    const result = await Swal.fire({
      title: "Excluir feedback?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Excluir",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/projetos/${id}/feedbacks/${feedbackId}`);
        Swal.fire("Removido!", "O feedback foi excluído.", "success");
        fetchFeedbacks();
      } catch (err) {
        Swal.fire("Erro", "Falha ao excluir feedback.", "error");
      }
    }
  };

  const handleEditFeedback = async (feedback) => {
    const { value: text } = await Swal.fire({
      title: "Editar seu Feedback",
      input: "textarea",
      inputValue: feedback.mensagem,
      showCancelButton: true,
    });

    if (text) {
      try {
        await api.put(`/api/projetos/${id}/feedbacks/${feedback.id}`, {
          mensagem: text,
        });
        Swal.fire("Atualizado!", "Sua mensagem foi editada.", "success");
        fetchFeedbacks();
      } catch (err) {
        Swal.fire("Erro", "Falha ao editar.", "error");
      }
    }
  };

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

      Swal.fire({
        title: "Sucesso!",
        text: "Post criado com sucesso!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setNewPostContent("");
      setNewPostFile(null);
      fetchProject();
    } catch (err) {
      console.error("Erro ao postar", err);
      Swal.fire("Erro", "Não foi possível criar o post.", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Excluir publicação?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/projetos/${id}/posts/${postId}`);

        Swal.fire("Excluído!", "A publicação foi removida.", "success");
        fetchProject();
      } catch (err) {
        console.error(err);
        Swal.fire("Erro", "Não foi possível excluir o post.", "error");
      }
    }
  };

  const handleEditPost = async (post) => {
    const { value: text } = await Swal.fire({
      title: "Editar Publicação",
      input: "textarea",
      inputValue: post.conteudo,
      showCancelButton: true,
      confirmButtonColor: "#059669",
    });

    if (text) {
      try {
        await api.put(`/api/projetos/${id}/posts/${post.id}`, {
          conteudo: text,
        });

        Swal.fire("Sucesso!", "Post atualizado.", "success");
        fetchProject();
      } catch (err) {
        console.error(err);
        Swal.fire("Erro", "Falha ao atualizar post.", "error");
      }
    }
  };

  const handleAddMember = async (memberId) => {
    try {
      const endpoint = memberType === 'participante'
        ? `/api/projetos/${id}/participantes/${memberId}`
        : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.post(endpoint);

      Swal.fire({
        title: "Sucesso!",
        text: `${memberType === 'participante' ? 'Participante' : 'Coordenador'} adicionado com sucesso!`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      setShowMemberModal(false);
      fetchProject();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
      Swal.fire("Erro", "Não foi possível adicionar o membro.", "error");
    }
  };

  const handleRemoveMember = async (memberId, type) => {
    const label = type === 'participante' ? 'participante' : 'coordenador';

    const result = await Swal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente remover este ${label} do projeto?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, remover!",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      const endpoint = type === 'participante'
        ? `/api/projetos/${id}/participantes/${memberId}`
        : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.delete(endpoint);

      Swal.fire({
        title: "Removido!",
        text: "O membro foi removido com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      fetchProject();
    } catch (err) {
      console.error("Erro ao remover:", err);
      Swal.fire("Erro", "Não foi possível remover o membro.", "error");
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      const projetoPayload = {
        nome: editData.title,
        descricao: editData.description,
        area: editData.area,
        dataInicio: editData.startDate ? new Date(editData.startDate) : null,
        dataFim: editData.endDate ? new Date(editData.endDate) : null,
        cargaHoraria: editData.workload ? parseFloat(editData.workload) : null,
        formato: editData.format,
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
        formData.append("imagem", novaImagem);
      }

      if (editData.novosDocumentos && editData.novosDocumentos.length > 0) {
        editData.novosDocumentos.forEach((file) => {
          formData.append("documentos", file);
        });
      }

      await api.put(`/api/projetos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Sucesso!",
        text: "Projeto atualizado com sucesso!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setNovaImagem(null);
      setEditData((prev) => ({ ...prev, novosDocumentos: [] }));
      setIsEditing(false);
      fetchProject();
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
      Swal.fire("Erro", "Não foi possível atualizar o projeto.", "error");
    }
  };

  const processarArquivos = (files) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      Swal.fire("Erro", "Apenas arquivos PDF são permitidos.", "error");
    }

    if (pdfFiles.length === 0) return;

    const totalDocs =
      (project?.documentos?.length || 0) +
      editData.novosDocumentos.length +
      pdfFiles.length;

    if (totalDocs > 10) {
      Swal.fire("Erro", "Limite total de 10 documentos atingido.", "error");
      return;
    }

    setEditData((prev) => ({
      ...prev,
      novosDocumentos: [...prev.novosDocumentos, ...pdfFiles],
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    processarArquivos(files);
    e.target.value = "";
  };

  // 2. Manipulador do Drop (Arrastar e Soltar)
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    processarArquivos(files);
  };

  // 3. Permite o arrastar (Necessário para o Drop funcionar)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeNovoDocumento = (index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setEditData((prev) => ({
      ...prev,
      novosDocumentos: prev.novosDocumentos.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteDocumento = async (docId) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Este documento será excluído permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    console.log("Tentando excluir documento ID:", docId);

    try {
      await api.delete(`/api/documentos/${docId}`);

      await Swal.fire({
        title: "Documento excluído!",
        text: "O documento foi removido com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchProject();
    } catch (e) {
      console.error("Erro ao deletar documento", e);
      Swal.fire("Erro", "Não foi possível excluir o documento.", "error");
    }
  };

  const removeItem = (type, index) => {
    setEditData({
      ...editData,
      [type]: editData[type].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
        <button onClick={() => navigate('/projetos')} className="mt-4 text-blue-600 hover:underline">
          Voltar para lista
        </button>
      </div>
    );
  }

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
                            <label className="block text-xs text-gray-500">
                              Início
                            </label>
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

                            <label className="block text-xs text-gray-500">
                              Fim
                            </label>
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
                          <p className="text-gray-600 capitalize">
                            {project.dataInicio
                              ? new Date(project.dataInicio).toLocaleDateString(
                                "pt-BR",
                              )
                              : "Data indef."}
                            {" - "}
                            {project.dataFim
                              ? new Date(project.dataFim).toLocaleDateString(
                                "pt-BR",
                              )
                              : "Data indef."}
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
                      <Laptop className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
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
                            <option value="">Selecione...</option>
                            <option value="PRESENCIAL">Presencial</option>
                            <option value="REMOTO">Remoto</option>
                            <option value="HIBRIDO">Híbrido</option>
                          </select>
                        ) : (
                          <p className="text-gray-600">
                            {FORMATO_MAP[project.formato || editData.format] ||
                              project.formato}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start col-span-1 gap-3 md:col-span-2">
                      <MapPin className="flex-shrink-0 w-5 h-5 mt-1 text-emerald-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Instituição de Ensino
                        </h3>

                        {isEditing ? (
                          <div className="flex flex-col gap-3 p-3 mt-2 border border-gray-200 rounded-lg bg-gray-50">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">
                                Nome
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: IFPR"
                                value={editData.instNome}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    instNome: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="flex gap-3">
                              <div className="w-1/3">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                  UF
                                </label>
                                <select
                                  value={editData.instEstado}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      instEstado: e.target.value,
                                      instCidade: "",
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  <option value="">--</option>
                                  {estados.map((uf) => (
                                    <option key={uf.id} value={uf.sigla}>
                                      {uf.sigla}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="w-2/3">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                  Cidade
                                </label>
                                <select
                                  value={editData.instCidade}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      instCidade: e.target.value,
                                    })
                                  }
                                  disabled={!editData.instEstado}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                >
                                  <option value="">Selecione...</option>
                                  {cidades.map((c) => (
                                    <option key={c.id} value={c.nome}>
                                      {c.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="font-medium text-gray-800">
                              {project.instituicaoEnsino?.nome ||
                                "Não informada"}
                            </p>
                            {project.instituicaoEnsino?.cidade && (
                              <p className="text-sm text-gray-500">
                                {project.instituicaoEnsino.cidade}
                                {project.instituicaoEnsino.estado &&
                                  ` - ${project.instituicaoEnsino.estado}`}
                              </p>
                            )}
                          </div>
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
                            <p className="font-semibold text-gray-900">{coord.nome}</p>
                            <p className="text-xs text-blue-600">Coordenador</p>
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
                  <div className="pt-8 mt-8 border-t border-gray-200">
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Anexar Documentos e Editais
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Selecione arquivos <strong>apenas em formato PDF</strong>{" "}
                      (Máx. 10MB cada). Limite de 10 arquivos no total.
                    </p>

                    {/* Área de Upload com Drag & Drop */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="relative w-full h-32 transition-colors border-2 border-dashed rounded-xl bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50"
                    >
                      <input
                        type="file"
                        id="doc-upload"
                        className="hidden"
                        multiple
                        accept=".pdf"
                        onChange={handleDocumentUpload}
                        disabled={
                          (project?.documentos?.length || 0) +
                          editData.novosDocumentos.length >= 10
                        }
                      />

                      <label
                        htmlFor="doc-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-emerald-500" />
                          <p className="mb-1 text-sm text-gray-700">
                            <span className="font-semibold">Clique para enviar</span> ou arraste
                          </p>
                        </div>
                      </label>
                    </div>

                    {editData.novosDocumentos && editData.novosDocumentos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">
                          Arquivos para enviar:
                        </h4>
                        {editData.novosDocumentos.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50 border-emerald-100"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium truncate text-emerald-800">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => removeNovoDocumento(idx, e)}
                              className="p-1 text-emerald-600 hover:text-red-500 hover:bg-emerald-100 rounded transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">
                                  {user.nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email || user.cpf || "Sem contato"}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">

                                <button
                                  onClick={() => handleAddMember(user.id)}
                                  className="p-2 transition-colors rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  title="Adicionar ao projeto"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
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
                        <div className="flex items-center justify-between p-4 border-b border-gray-50">
                          <div className="flex items-center gap-3">
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

                          {isOwner && isEditing && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                title="Editar publicação"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Excluir publicação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
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
                  {/* {posts && posts.length > 0 ? (
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
                  )} */}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <FileText className="w-5 h-5 text-emerald-600" /> Documentos
                    Disponíveis
                  </h2>
                  {project.documentos && project.documentos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {project.documentos.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 transition-all bg-white border border-gray-200 rounded-xl hover:shadow-md group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-red-50">
                              <FileText className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {doc.nome}
                              </p>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:underline"
                              >
                                Visualizar PDF <ArrowRight size={10} />
                              </a>
                            </div>
                          </div>
                          {isOwner && isEditing && (
                            <button
                              onClick={() => handleDeleteDocumento(doc.id)}
                              className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                              title="Excluir documento"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center border border-gray-300 border-dashed bg-gray-50 rounded-xl">
                      <p className="text-gray-500">
                        Nenhum documento cadastrado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="space-y-8 duration-500 animate-in fade-in">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="space-y-8 lg:col-span-2">
                    <div className="relative p-6 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                      <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        Enviar Feedback do Projeto
                      </h3>

                      {isParticipant ? (
                        <form
                          onSubmit={HandlerSendFeedback}
                          className="space-y-4"
                        >
                          <div className="flex flex-col gap-4 p-4 text-sm border rounded-lg bg-emerald-50/50 border-emerald-100 md:flex-row md:items-center">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <User className="w-4 h-4" />
                              <span className="font-semibold">De:</span>
                              <span>{novoComentario.nome}</span>
                            </div>
                            <div className="hidden w-px h-4 md:block bg-emerald-200"></div>
                            <div className="flex items-center gap-2 text-emerald-800">
                              <Mail className="w-4 h-4" />
                              <span>{novoComentario.email}</span>
                            </div>
                            <div className="hidden w-px h-4 md:block bg-emerald-200"></div>
                            <div className="flex items-center gap-2 ml-auto italic text-emerald-600">
                              <Check className="w-3 h-3" />
                              <span>Participante Verificado</span>
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2 text-xs font-bold text-gray-500 uppercase">
                              Sua Mensagem
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={novoComentario.mensagem}
                              onChange={(e) =>
                                setNewComment({
                                  ...novoComentario,
                                  mensagem: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 placeholder-gray-400 transition-all bg-white border border-gray-300 rounded-lg shadow-sm outline-none resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Escreva aqui seu feedback, sugestão ou dúvida para a coordenação..."
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95"
                            >
                              <Send size={16} /> Enviar Feedback
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50">
                          <div className="p-3 mb-3 bg-gray-100 rounded-full">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="mb-1 font-bold text-gray-700">
                            Acesso Restrito a Participantes
                          </h4>
                          <p className="max-w-md px-4 text-sm text-gray-500">
                            Apenas participantes ativos vinculados a este
                            projeto podem enviar feedbacks. Entre em contato com
                            a coordenação se acredita que isso é um erro.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="px-1 mb-4 text-lg font-bold text-gray-800">
                        Feedbacks Anteriores ({comentarios.length})
                      </h3>

                      {loadingComentarios ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin"></div>
                        </div>
                      ) : comentarios.length > 0 ? (
                        <div className="space-y-4">
                          {comentarios.map((comentario, index) => {
                            const userLogado = getLoggedUser();
                            const isAuthor =
                              userLogado?.sub === comentario.email;
                            const canDelete =
                              isAuthor || (isOwner && isEditing);

                            return (
                              <div
                                key={comentario.id || index}
                                className="p-5 transition-shadow bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md"
                              >
                                {/* CABEÇALHO DO FEEDBACK */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold uppercase rounded-full bg-emerald-100 text-emerald-700">
                                      {comentario.nome
                                        ? comentario.nome.substring(0, 2)
                                        : "AN"}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">
                                        {comentario.nome}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                                          {comentario.tipoContato || "FEEDBACK"}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                          <Clock size={10} />
                                          {comentario.dataEnvio
                                            ? new Date(
                                              comentario.dataEnvio,
                                            ).toLocaleDateString()
                                            : "Recentemente"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    {isAuthor && (
                                      <button
                                        onClick={() =>
                                          handleEditFeedback(comentario)
                                        }
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar meu feedback"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                    )}

                                    {canDelete && (
                                      <button
                                        onClick={() =>
                                          handleDeleteFeedback(comentario.id)
                                        }
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir feedback"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="text-gray-600 text-sm pl-[52px] leading-relaxed whitespace-pre-wrap">
                                  {comentario.mensagem}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-10 text-center bg-white border border-gray-200 border-dashed rounded-xl">
                          <p className="text-sm font-medium text-gray-500">
                            Nenhum feedback registrado ainda.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="sticky p-6 border shadow-sm bg-gradient-to-br from-emerald-50 to-white border-emerald-100 rounded-xl top-24">
                      <h3 className="pb-2 mb-4 text-sm font-bold tracking-wide uppercase border-b text-emerald-900 border-emerald-100">
                        Coordenação
                      </h3>
                      <div className="space-y-5">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">
                              Responsável
                            </span>
                            <span className="block text-sm font-medium text-gray-800">
                              {coordenadorPrincipal?.nome || "Não informado"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div className="w-full overflow-hidden">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">
                              Contato
                            </span>
                            {coordenadorPrincipal?.conta?.email ? (
                              <span className="block text-sm font-medium text-gray-700 break-all select-all">
                                {coordenadorPrincipal.conta?.email}
                              </span>
                            ) : (
                              <span className="text-sm italic text-gray-400">
                                E-mail indisponível
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">
                              Telefone
                            </span>
                            <span className="block text-sm font-medium text-gray-800">
                              {coordenadorPrincipal?.telefone ||
                                "Não informado"}
                            </span>
                          </div>
                        </div>
                      </div>
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
