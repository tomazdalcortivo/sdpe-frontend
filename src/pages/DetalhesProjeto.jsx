import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit2, Calendar, Clock, Users, Target, BookOpen, MapPin,
  Globe, Facebook, Instagram, Linkedin, Youtube, Upload, X, FileText,
  Image as ImageIcon, MessageSquare, Mail,
  Plus, Trash2, Search, UserPlus, Send, Check, User,
  Laptop, ArrowRight
} from 'lucide-react';
import Swal from "sweetalert2";
import defaultImage from '../assets/capa-padrao-projeto.png';
import api, { getLoggedUser } from '../services/api';

export default function DetalhesProjeto() {


  const FORMATO_MAP = {
    PRESENCIAL: "Presencial",
    REMOTO: "Remoto",
    HIBRIDO: "Híbrido"
  };

  const FUNCAO_COORDENADOR_MAP = {
    COORDENADOR_GERAL: "Coordenador Geral",
    COORDENADOR_ADJUNTO: "Coordenador Adjunto",
  };

  const formatarFuncao = (funcao) => {
    if (!funcao) return "Coordenador";
    return FUNCAO_COORDENADOR_MAP[funcao] ||
      funcao.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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
  const [novoComentario, setNewComment] = useState({ nome: "", email: "", mensagem: "" });
  const [loadingComentarios, setLoadingComentarios] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberType, setMemberType] = useState('participante');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const viewRecorded = useRef(false);
  const coordenadorPrincipal = project?.coordenadores?.[0];

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    area: '',
    startDate: '',
    endDate: '',
    workload: '',
    format: 'Presencial',
    participants: [],
    socialMedia: { website: '', facebook: '', instagram: '', linkedin: '', youtube: '' },
    instNome: '',
    instCidade: '',
    instEstado: '',
    novosDocumentos: [],
  });

  const baseURL = api && api.defaults && api.defaults.baseURL ? api.defaults.baseURL : 'http://localhost:8080';
  const getImageUrl = (id) => `${baseURL}/api/projetos/${id}/imagem`;

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    async function loadAllData() {
      if (id) {
        setLoading(true);
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
  }, [activeTab, id]);

  useEffect(() => {
    async function carregarCidades() {
      if (isEditing && editData.instEstado) {
        try {
          const res = await api.get(`/api/localidades/estados/${editData.instEstado}/cidades`);
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
      setLoading(true);
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
          email: currentUserEmail,
          mensagem: ""
        }));
      } else {
        setIsParticipant(false);
      }

      setEditData({
        title: response.data.nome || '',
        description: response.data.descricao || '',
        area: response.data.area || '',
        startDate: data.dataInicio ? data.dataInicio.split('T')[0] : '',
        endDate: data.dataFim ? data.dataFim.split('T')[0] : '',
        workload: data.cargaHoraria ? String(data.cargaHoraria) : '',
        format: data.formato || 'Presencial',
        instNome: data.instituicaoEnsino?.nome || "",
        instCidade: data.instituicaoEnsino?.cidade || "",
        instEstado: data.instituicaoEnsino?.estado || "",
        participants: data.participantes || [],
        socialMedia: {
          website: data.redesSociais?.website || '',
          facebook: data.redesSociais?.facebook || '',
          instagram: data.redesSociais?.instagram || '',
          linkedin: data.redesSociais?.linkedin || '',
          youtube: data.redesSociais?.youtube || ''
        },
        novosDocumentos: []
      });
    } catch (err) {
      console.error('Erro ao buscar projeto:', err);
      setError('Não foi possível carregar o projeto.');
    } finally {
      setLoading(false);
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

      setNewComment(prev => ({ ...prev, mensagem: "" }));

      Swal.fire({
        title: "Sucesso!",
        text: "Feedback enviado com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      fetchFeedbacks();

    } catch (error) {
      console.error("Erro detalhado no envio:", error);
      if (error.response && error.response.status === 201) {
        fetchFeedbacks();
        setNewComment(prev => ({ ...prev, mensagem: "" }));
        Swal.fire("Sucesso!", "Feedback enviado.", "success");
      } else {
        Swal.fire("Erro", "Não foi possível enviar o feedback.", "error");
      }
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      let response;
      if (memberType === 'participante') {
        response = await api.get(`/api/participantes/buscar?nome=${searchTerm}`);
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
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
        showConfirmButton: false
      });
      setNewPostContent("");
      setNewPostFile(null);
      fetchProject();
    } catch (err) {
      console.error("Erro ao postar", err);
      Swal.fire("Erro", "Não foi possível criar o post.", "error");
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
      Swal.fire("Erro", "Não foi possível adicionar o membro. Verifique se ele já não faz parte do projeto.", "error");
    }
  };

  const handleRemoveMember = async (memberId, type) => {
    if (!window.confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      const endpoint = type === 'participante'
        ? `/api/projetos/${id}/participantes/${memberId}`
        : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.delete(endpoint);
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
          estado: editData.instEstado
        }
      };

      formData.append("projeto", new Blob([JSON.stringify(projetoPayload)], {
        type: "application/json"
      }));

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
        showConfirmButton: false
      });

      Swal.fire({
        title: "Sucesso!",
        text: "Projeto atualizado com sucesso!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      setNovaImagem(null);
      setEditData(prev => ({ ...prev, novosDocumentos: [] }));
      setIsEditing(false);
      fetchProject();

    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      Swal.fire("Erro", "Não foi possível atualizar o projeto.", "error");
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalDocs = (project?.documentos?.length || 0) + editData.novosDocumentos.length + files.length;

    if (totalDocs > 10) {
      alert("Limite total de 10 documentos atingido (Existentes + Novos).");
      return;
    }

    setEditData(prev => ({
      ...prev,
      novosDocumentos: [...prev.novosDocumentos, ...files]
    }));
  };

  const removeNovoDocumento = (index) => {
    setEditData(prev => ({
      ...prev,
      novosDocumentos: prev.novosDocumentos.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteDocumento = async (docId) => {
    if (!window.confirm("Deseja realmente excluir este documento?")) return;
    try {
      // Requer endpoint DELETE /api/documentos/{id} no backend
      await api.delete(`/api/documentos/${docId}`);
      alert("Documento removido!");
      fetchProject();
    } catch (e) {
      console.error("Erro ao deletar documento", e);
      alert("Erro ao excluir documento. Verifique se a rota existe no backend.");
    }
  }


  const removeItem = (type, index) => {
    setEditData({ ...editData, [type]: editData[type].filter((_, i) => i !== index) });
  };

  if (loading) return <p className="p-10">Carregando...</p>;

  if (error || !project)
    return (
      <div className="p-10 text-center">
        <p>{error || "Projeto não encontrado"}</p>
        <button
          onClick={handleBack}
          className="mt-4 text-emerald-600"
        >
          Voltar
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-80 overflow-hidden">
            <img
              src={novaImagem ? URL.createObjectURL(novaImagem) : getImageUrl(project.id)}
              alt={project.nome || project.title}
              onError={(e) => { e.target.src = defaultImage; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              {isEditing ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 w-fit px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg cursor-pointer transition-all border border-white/20">
                    <Upload className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">Alterar Capa</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setNovaImagem(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="text-3xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg w-full text-white" />
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">{project.area || project.category}</span>
                    <span className="text-sm opacity-90">{project.status === false ? 'Inativo' : 'Em andamento'}</span>
                    <span className="text-sm opacity-90 border border-white/30 px-2 py-1 rounded">{project.formato || editData.format}</span>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold">{project.nome || project.title}</h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">{project.area || project.category}</span>
                    <span className="text-sm opacity-90">{project.status === false ? 'Inativo' : 'Em andamento'}</span>
                    <span className="text-sm opacity-90 border border-white/30 px-2 py-1 rounded">{project.formato || editData.format}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="p-6 border-b border-gray-100">
              <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${isEditing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'}`}>
                <Edit2 className="w-5 h-5" />
                {isEditing ? 'Cancelar Edição' : 'Editar Projeto'}
              </button>
            </div>
          )}

          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button onClick={() => setActiveTab('overview')} className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'}`}>Visão Geral</button>
              <button onClick={() => setActiveTab('feed')} className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === 'feed' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-emerald-600'}`}>Feed de Notícias</button>
              <button onClick={() => setActiveTab('documents')} className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === 'documents' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'}`}>Editais</button>
              <button onClick={() => setActiveTab('feedback')} className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === 'feedback' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'}`}>Feedback</button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {activeTab === 'overview' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-600" />Descrição</h2>
                  {isEditing ? (
                    <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{project.descricao || project.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Área de Aplicação</h3>
                        {isEditing ? (
                          <input type="text" value={editData.area} onChange={(e) => setEditData({ ...editData, area: e.target.value })} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        ) : (
                          <p className="text-gray-600">{project.area || project.category}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Período</h3>
                        {isEditing ? (
                          <div className="space-y-2 mt-1">
                            <label className="block text-xs text-gray-500">Início</label>
                            <input
                              type="date"
                              value={editData.startDate}
                              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <label className="block text-xs text-gray-500">Fim</label>
                            <input
                              type="date"
                              value={editData.endDate}
                              onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-600 capitalize">
                            {project.dataInicio ? new Date(project.dataInicio).toLocaleDateString('pt-BR') : 'Data indef.'}
                            {' - '}
                            {project.dataFim ? new Date(project.dataFim).toLocaleDateString('pt-BR') : 'Data indef.'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Carga Horária</h3>
                        {isEditing ? (
                          <input type="text" value={editData.workload} onChange={(e) => setEditData({ ...editData, workload: e.target.value })} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        ) : (
                          <p className="text-gray-600">{project.cargaHoraria || editData.workload} horas</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Laptop className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Formato</h3>
                        {isEditing ? (
                          <select value={editData.format} onChange={(e) => setEditData({ ...editData, format: e.target.value })} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">

                            <option value="">Selecione...</option>
                            <option value="PRESENCIAL">Presencial</option>
                            <option value="REMOTO">Remoto</option>
                            <option value="HIBRIDO">Híbrido</option>
                          </select>
                        ) : (
                          <p className="text-gray-600">
                            {FORMATO_MAP[project.formato || editData.format] || project.formato}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                      <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Instituição de Ensino</h3>

                        {isEditing ? (
                          <div className="flex flex-col gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                              <input
                                type="text"
                                placeholder="Ex: IFPR"
                                value={editData.instNome}
                                onChange={(e) => setEditData({ ...editData, instNome: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="flex gap-3">
                              <div className="w-1/3">
                                <label className="text-xs font-bold text-gray-500 uppercase">UF</label>
                                <select
                                  value={editData.instEstado}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    instEstado: e.target.value,
                                    instCidade: ""
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                  <option value="">--</option>
                                  {estados.map((uf) => (
                                    <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="w-2/3">
                                <label className="text-xs font-bold text-gray-500 uppercase">Cidade</label>
                                <select
                                  value={editData.instCidade}
                                  onChange={(e) => setEditData({ ...editData, instCidade: e.target.value })}
                                  disabled={!editData.instEstado}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-gray-100"
                                >
                                  <option value="">Selecione...</option>
                                  {cidades.map((c) => (
                                    <option key={c.id} value={c.nome}>{c.nome}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="font-medium text-gray-800">
                              {project.instituicaoEnsino?.nome || "Não informada"}
                            </p>
                            {project.instituicaoEnsino?.cidade && (
                              <p className="text-sm text-gray-500">
                                {project.instituicaoEnsino.cidade}
                                {project.instituicaoEnsino.estado && ` - ${project.instituicaoEnsino.estado}`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Participantes</h3>
                        <p className="text-gray-600">{(project.participantes && project.participantes.length) || editData.participants.length} membros ativos</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Equipe do Projeto</h2>
                    {isOwner && isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setMemberType('participante'); setShowMemberModal(true); setSearchResults([]); setSearchTerm(''); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium"
                        >
                          <UserPlus className="w-4 h-4" /> Add Participante
                        </button>
                        <button
                          onClick={() => { setMemberType('coordenador'); setShowMemberModal(true); setSearchResults([]); setSearchTerm(''); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                        >
                          <UserPlus className="w-4 h-4" /> Add Coordenador
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Coordenadores</h3>
                  <div className="space-y-2 mb-6">
                    {(project.coordenadores || []).map((coord) => (
                      <div key={coord.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(coord.nome || 'C').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{coord.nome}</p>
                            <p className="text-xs text-blue-600">{formatarFuncao(coord.funcao)}</p>
                          </div>
                        </div>
                        {isOwner && isEditing && (
                          <button onClick={() => handleRemoveMember(coord.id, 'coordenador')} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Participantes</h3>
                  <div className="space-y-2">
                    {(project.participantes || []).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(member.nome || 'P').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.nome}</p>
                            <p className="text-sm text-gray-600">Participante</p>
                          </div>
                        </div>
                        {isOwner && isEditing && (
                          <button onClick={() => handleRemoveMember(member.id, 'participante')} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!project.participantes || project.participantes.length === 0) && (
                      <p className="text-gray-500 text-sm italic">Nenhum participante registrado.</p>
                    )}
                  </div>
                </div>

                {!isEditing && project.redesSociais && Object.values(project.redesSociais).some(url => url) && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Acompanhe nas Redes</h2>
                    <div className="flex flex-wrap gap-4">
                      {project.redesSociais.website && (
                        <a href={project.redesSociais.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors text-gray-700 font-medium">
                          <Globe className="w-5 h-5" /> Website
                        </a>
                      )}
                      {project.redesSociais.facebook && (
                        <a href={project.redesSociais.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors text-blue-600 font-medium">
                          <Facebook className="w-5 h-5" /> Facebook
                        </a>
                      )}
                      {project.redesSociais.instagram && (
                        <a href={project.redesSociais.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full hover:bg-pink-100 hover:text-pink-700 transition-colors text-pink-600 font-medium">
                          <Instagram className="w-5 h-5" /> Instagram
                        </a>
                      )}
                      {project.redesSociais.linkedin && (
                        <a href={project.redesSociais.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors text-blue-700 font-medium">
                          <Linkedin className="w-5 h-5" /> LinkedIn
                        </a>
                      )}
                      {project.redesSociais.youtube && (
                        <a href={project.redesSociais.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors text-red-600 font-medium">
                          <Youtube className="w-5 h-5" /> YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {isEditing && (
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Redes Sociais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <input type="url" placeholder="Website" value={editData.socialMedia.website} onChange={(e) => setEditData({ ...editData, socialMedia: { ...editData.socialMedia, website: e.target.value } })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <input type="url" placeholder="Facebook" value={editData.socialMedia.facebook} onChange={(e) => setEditData({ ...editData, socialMedia: { ...editData.socialMedia, facebook: e.target.value } })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-pink-600" />
                        <input type="url" placeholder="Instagram" value={editData.socialMedia.instagram} onChange={(e) => setEditData({ ...editData, socialMedia: { ...editData.socialMedia, instagram: e.target.value } })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <input type="url" placeholder="LinkedIn" value={editData.socialMedia.linkedin} onChange={(e) => setEditData({ ...editData, socialMedia: { ...editData.socialMedia, linkedin: e.target.value } })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="flex items-center gap-3 md:col-span-2">
                        <Youtube className="w-5 h-5 text-red-600" />
                        <input type="url" placeholder="YouTube" value={editData.socialMedia.youtube} onChange={(e) => setEditData({ ...editData, socialMedia: { ...editData.socialMedia, youtube: e.target.value } })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-8 border-t border-gray-200 mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Anexar Documentos e Editais
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Selecione arquivos PDF, DOC ou DOCX (Máx. 10MB cada). Limite de 10 arquivos no total.
                    </p>

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-emerald-100 border-dashed rounded-xl cursor-pointer bg-emerald-50/30 hover:bg-emerald-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-emerald-500" />
                        <p className="mb-1 text-sm text-gray-700"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={handleDocumentUpload}
                        disabled={((project?.documentos?.length || 0) + editData.novosDocumentos.length) >= 10}
                      />
                    </label>

                    {/* Lista de Pré-visualização do Upload */}
                    {editData.novosDocumentos && editData.novosDocumentos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">Arquivos para enviar:</h4>
                        {editData.novosDocumentos.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium text-emerald-800 truncate">{file.name}</span>
                            </div>
                            <button onClick={() => removeNovoDocumento(idx)} className="text-emerald-600 hover:text-red-500"><X size={18} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="border-t border-gray-200 pt-8">
                    <button onClick={handleSave} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg">Salvar Alterações</button>
                  </div>
                )}

                {showMemberModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">
                          Adicionar {memberType === 'participante' ? 'Participante' : 'Coordenador'}
                        </h3>
                        <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600">
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
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                          <button
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {searchLoading ? '...' : <Search className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {searchResults.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                              <div>
                                <p className="font-semibold text-gray-800">{user.nome}</p>
                                <p className="text-xs text-gray-500">{user.email || user.cpf || 'Sem contato'}</p>
                              </div>
                              <button
                                onClick={() => handleAddMember(user.id)}
                                className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {searchResults.length === 0 && !searchLoading && searchTerm && (
                            <p className="text-center text-gray-500">Nenhum usuário encontrado.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'feed' && (
              <div className="max-w-3xl mx-auto space-y-8">

                {isOwner && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Criar nova publicação</h3>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="O que há de novo no projeto?"
                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <label className="cursor-pointer text-gray-500 hover:text-emerald-600 flex items-center gap-2 text-sm">
                        <ImageIcon className="w-5 h-5" />
                        <span>Adicionar Mídia</span>
                        <input type="file" className="hidden" onChange={(e) => setNewPostFile(e.target.files[0])} />
                      </label>
                      {newPostFile && <span className="text-xs text-emerald-600 truncate max-w-[150px]">{newPostFile.name}</span>}

                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Publicar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {post.autor?.nome?.slice(0, 2).toUpperCase() || 'AD'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{post.autor?.nome || 'Coordenador'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.dataPublicacao).toLocaleDateString()} às {new Date(post.dataPublicacao).toLocaleTimeString().slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {post.conteudo}
                        </div>

                        {post.mediaUrl && (
                          <div className="w-full bg-gray-100">
                            <img
                              src={post.mediaUrl}
                              alt="Mídia"
                              className="w-full max-h-[500px] object-contain" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p>Ainda não há publicações neste feed.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- ABA DOCUMENTOS (SOMENTE VISUALIZAÇÃO/EXCLUSÃO) --- */}
            {activeTab === 'documents' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-600" /> Documentos Disponíveis</h2>
                  {project.documentos && project.documentos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {project.documentos.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-50 rounded-lg"><FileText className="w-6 h-6 text-red-500" /></div>
                            <div>
                              <p className="font-medium text-gray-800">{doc.nome}</p>
                              <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">Visualizar PDF <ArrowRight size={10} /></a>
                            </div>
                          </div>
                          {isOwner && isEditing && (
                            <button onClick={() => handleDeleteDocumento(doc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir documento"><Trash2 size={18} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500">Nenhum documento cadastrado.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        Enviar Feedback do Projeto
                      </h3>

                      {isParticipant ? (
                        <form onSubmit={HandlerSendFeedback} className="space-y-4">

                          <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 flex flex-col md:flex-row gap-4 md:items-center text-sm">
                            <div className="flex items-center gap-2 text-emerald-800">
                              <User className="w-4 h-4" />
                              <span className="font-semibold">De:</span>
                              <span>{novoComentario.nome}</span>
                            </div>
                            <div className="hidden md:block w-px h-4 bg-emerald-200"></div>
                            <div className="flex items-center gap-2 text-emerald-800">
                              <Mail className="w-4 h-4" />
                              <span>{novoComentario.email}</span>
                            </div>
                            <div className="hidden md:block w-px h-4 bg-emerald-200"></div>
                            <div className="flex items-center gap-2 text-emerald-600 italic ml-auto">
                              <Check className="w-3 h-3" />
                              <span>Participante Verificado</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sua Mensagem</label>
                            <textarea
                              required
                              rows={4}
                              value={novoComentario.mensagem}
                              onChange={e => setNewComment({ ...novoComentario, mensagem: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm placeholder-gray-400"
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
                        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                          <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-gray-700 font-bold mb-1">Acesso Restrito a Participantes</h4>
                          <p className="text-sm text-gray-500 max-w-md px-4">
                            Apenas participantes ativos vinculados a este projeto podem enviar feedbacks.
                            Entre em contato com a coordenação se acredita que isso é um erro.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">
                        Feedbacks Anteriores ({comentarios.length})
                      </h3>

                      {loadingComentarios ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : comentarios.length > 0 ? (
                        <div className="space-y-4">
                          {comentarios.map((comentario, index) => (
                            <div key={comentario.id || index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm uppercase">
                                    {comentario.nome ? comentario.nome.substring(0, 2) : "AN"}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{comentario.nome}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                                        {comentario.tipoContato || "FEEDBACK"}
                                      </span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        {comentario.dataEnvio ? new Date(comentario.dataEnvio).toLocaleDateString() : "Recentemente"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm pl-[52px] leading-relaxed whitespace-pre-wrap">
                                {comentario.mensagem}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-500 font-medium text-sm">Nenhum feedback registrado ainda.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-sm sticky top-24">
                      <h3 className="font-bold text-emerald-900 mb-4 border-b border-emerald-100 pb-2 text-sm uppercase tracking-wide">
                        Coordenação
                      </h3>
                      <div className="space-y-5">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Responsável</span>
                            <span className="text-gray-800 font-medium text-sm block">
                              {coordenadorPrincipal?.nome || "Não informado"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div className="overflow-hidden w-full">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Contato</span>
                            {coordenadorPrincipal?.conta?.email ? (
                              <span className="text-gray-700 text-sm block break-all select-all font-medium">
                                {coordenadorPrincipal.conta.email}
                              </span>
                            ) : <span className="text-gray-400 italic text-sm">E-mail indisponível</span>}
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
    </div >
  );
}