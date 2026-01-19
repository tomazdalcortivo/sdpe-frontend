import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit2, Calendar, Clock, Users, Target, BookOpen, MapPin,
  Globe, Facebook, Instagram, Linkedin, Youtube, Upload, X, FileText,
  Image as ImageIcon, Video, MessageSquare, Mail, Phone,
  Plus, Trash2, Search, UserPlus
} from 'lucide-react';
import defaultImage from '../assets/capa-padrao-projeto.png';
import api, { getLoggedUser } from '../services/api';

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

  // Estados para Gestão de Equipe
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberType, setMemberType] = useState('participante');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    area: '',
    startDate: '',
    endDate: '',
    workload: '',
    format: 'Hibrido',
    planning: '',
    participants: [],
    socialMedia: { website: '', facebook: '', instagram: '', linkedin: '', youtube: '' },
    images: [],
    videos: [],
    documents: []
  });

  const baseURL = api && api.defaults && api.defaults.baseURL ? api.defaults.baseURL : 'http://localhost:8080';
  const getImageUrl = (id) => `${baseURL}/api/projetos/${id}/imagem`;

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  async function fetchProject() {
    try {
      setLoading(true);
      const response = await api.get(`/api/projetos/${id}`);
      const data = response.data;

      setProject(response.data);

      const user = getLoggedUser();
      const email = user?.sub;

      const owner = data.coordenadores?.some(
        (c) => c.conta?.email === email
      );

      setIsOwner(owner);

      setEditData({
        title: response.data.nome || '',
        description: response.data.descricao || '',
        area: response.data.area || '',
        startDate: data.dataInicio ? data.dataInicio.split('T')[0] : '',
        endDate: data.dataFim ? data.dataFim.split('T')[0] : '',
        workload: data.cargaHoraria ? String(data.cargaHoraria) : '',
        format: data.formato || 'Híbrido',
        planning: '',
        participants: data.participantes || [],
        socialMedia: {
          website: data.redesSociais?.website || '',
          facebook: data.redesSociais?.facebook || '',
          instagram: data.redesSociais?.instagram || '',
          linkedin: data.redesSociais?.linkedin || '',
          youtube: data.redesSociais?.youtube || ''
        },
        images: [],
        videos: [],
        documents: []
      });
    } catch (err) {
      console.error('Erro ao buscar projeto:', err);
      setError('Não foi possível carregar o projeto.');
    } finally {
      setLoading(false);
    }
  }

  // Funções de Busca e Gestão de Membros
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      let response;
      if (memberType === 'participante') {
        response = await api.get(`/api/participantes/buscar?nome=${searchTerm}`);
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        // Adaptar conforme seu backend. Se não houver busca por nome, talvez precise ajustar.
        // Assumindo que o endpoint /api/coordenadores/nome/{nome} existe e retorna um único objeto:
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

  const handleAddMember = async (memberId) => {
    try {
      const endpoint = memberType === 'participante'
        ? `/api/projetos/${id}/participantes/${memberId}`
        : `/api/projetos/${id}/coordenadores/${memberId}`;

      await api.post(endpoint);

      alert(`${memberType === 'participante' ? 'Participante' : 'Coordenador'} adicionado com sucesso!`);
      setShowMemberModal(false);
      fetchProject();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
      alert("Erro ao adicionar membro. Verifique se ele já não faz parte do projeto.");
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
      alert("Erro ao remover membro.");
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
        formato: editData.format?.toUpperCase(),
        redesSociais: editData.socialMedia
      };

      formData.append("projeto", new Blob([JSON.stringify(projetoPayload)], {
        type: "application/json"
      }));

      if (novaImagem) {
        formData.append("imagem", novaImagem);
      }

      await api.put(`/api/projetos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert('Projeto atualizado com sucesso!');

      setNovaImagem(null);
      setIsEditing(false);
      fetchProject();

    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      alert('Erro ao atualizar o projeto. Verifique o console.');
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && editData.images.length < 10) {
      const newImages = Array.from(files).slice(0, 10 - editData.images.length).map(f => URL.createObjectURL(f));
      setEditData({ ...editData, images: [...editData.images, ...newImages] });
    }
  };

  const handleVideoUpload = (e) => {
    const files = e.target.files;
    if (files && editData.videos.length < 5) {
      const newVideos = Array.from(files).slice(0, 5 - editData.videos.length).map(f => f.name);
      setEditData({ ...editData, videos: [...editData.videos, ...newVideos] });
    }
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (files && editData.documents.length < 10) {
      const newDocs = Array.from(files).slice(0, 10 - editData.documents.length).map(f => f.name);
      setEditData({ ...editData, documents: [...editData.documents, ...newDocs] });
    }
  };

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
              <button onClick={() => setActiveTab('multimedia')} className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === 'multimedia' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'}`}>Multimídia</button>
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
                            <input type="date" value={editData.startDate} onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            <input type="date" value={editData.endDate} onChange={(e) => setEditData({ ...editData, endDate: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                        ) : (
                          <p className="text-gray-600">{(project.dataInicio || 'Jan 2024').split('T')[0]} - {(project.dataFim || 'Dec 2024').split('T')[0]}</p>
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
                      <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Formato</h3>
                        {isEditing ? (
                          <select value={editData.format} onChange={(e) => setEditData({ ...editData, format: e.target.value })} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option>Presencial</option>
                            <option>Remoto</option>
                            <option>Híbrido</option>
                          </select>
                        ) : (
                          <p className="text-gray-600">{project.formato || editData.format}</p>
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

                {/* Seção de Equipe do Projeto */}
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

                  {/* Lista de Coordenadores */}
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
                            <p className="text-xs text-blue-600">{coord.funcao || 'Coordenador'}</p>
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

                  {/* Lista de Participantes */}
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

                {/* Seção de Redes Sociais (Apenas Leitura) */}
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
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Imagens do Projeto <span className="text-sm text-gray-500">(máx. 10 imagens, 5MB cada)</span></h2>
                    <div className="space-y-4">
                      <label className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600">Adicionar Imagens</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={editData.images.length >= 10} />
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {editData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                            <button onClick={() => removeItem('images', idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vídeos do Projeto <span className="text-sm text-gray-500">(máx. 5 vídeos, 50MB cada)</span></h2>
                    <div className="space-y-4">
                      <label className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                        <Video className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600">Adicionar Vídeos</span>
                        <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" disabled={editData.videos.length >= 5} />
                      </label>
                      <div className="space-y-2">
                        {editData.videos.map((video, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 text-sm">{video}</span>
                            <button onClick={() => removeItem('videos', idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentos e Editais <span className="text-sm text-gray-500">(máx. 10 arquivos, 10MB cada)</span></h2>
                    <div className="space-y-4">
                      <label className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                        <FileText className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-600">Adicionar Documentos (PDF, DOC, DOCX)</span>
                        <input type="file" accept=".pdf,.doc,.docx" multiple onChange={handleDocumentUpload} className="hidden" disabled={editData.documents.length >= 10} />
                      </label>
                      <div className="space-y-2">
                        {editData.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-600" /><span className="text-gray-700 text-sm">{doc}</span></div>
                            <button onClick={() => removeItem('documents', idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="border-t border-gray-200 pt-8">
                    <button onClick={handleSave} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg">Salvar Alterações</button>
                  </div>
                )}

                {/* MODAL DE BUSCA DE MEMBROS */}
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

            {activeTab === 'multimedia' && (
              <div className="space-y-8">{/* multimídia content (images & videos) - simplified display */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-emerald-600" />Galeria de Imagens</h2>
                  {project.imagens && project.imagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {project.imagens.map((imgUrl, i) => (
                        <img key={i} src={imgUrl} alt={`Projeto ${i + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma imagem disponível no momento</p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Video className="w-6 h-6 text-emerald-600" />Vídeos do Projeto</h2>
                  {project.videos && project.videos.length > 0 ? (
                    <div className="space-y-3">{project.videos.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"><Video className="w-5 h-5 text-emerald-600" /><span className="text-gray-700">{v}</span></div>
                    ))}</div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg"><Video className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhum vídeo disponível no momento</p></div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-600" />Documentos e Editais</h2>
                {project.documentos && project.documentos.length > 0 ? (
                  <div className="space-y-3">{project.documentos.map((d, i) => (
                    <a key={i} href={d.url || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors group"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-emerald-600" /><span className="text-gray-700 group-hover:text-emerald-700">{d.nome || d}</span></div><span className="text-sm text-gray-400 group-hover:text-emerald-600">Download</span></a>
                  ))}</div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhum documento disponível no momento</p></div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-8">{/* feedback UI simplified */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-emerald-600" />Conversas Públicas</h2>
                  <div className="space-y-4">
                    {(project.comentarios || []).map((c, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{(c.autor || 'U').slice(0, 2).toUpperCase()}</div><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-gray-900">{c.autor || 'Usuário'}</span><span className="text-sm text-gray-500">{c.tempo || ''}</span></div><p className="text-gray-700">{c.texto || c}</p></div></div></div>
                    ))}

                    <div className="border-2 border-gray-200 rounded-lg p-4"><textarea placeholder="Deixe seu comentário ou pergunta..." rows={4} className="w-full border-0 focus:outline-none resize-none text-gray-700" /><div className="flex justify-end mt-3"><button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-full">Enviar Comentário</button></div></div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Como Ingressar no Projeto</h2>
                  <div className="bg-gradient-to-br from-emerald-50 to-orange-50 rounded-xl p-6 md:p-8">
                    <p className="text-gray-700 mb-6 leading-relaxed">Interessado em participar deste projeto? Entre em contato com nossa equipe para mais informações sobre vagas disponíveis, requisitos e processo seletivo.</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"><Mail className="w-6 h-6 text-emerald-600 flex-shrink-0" /><div><p className="font-semibold text-gray-900">E-mail</p><a href="mailto:contato@projeto.edu.br" className="text-emerald-600 hover:text-emerald-700">contato@projeto.edu.br</a></div></div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"><Phone className="w-6 h-6 text-emerald-600 flex-shrink-0" /><div><p className="font-semibold text-gray-900">Telefone</p><a href="tel:+5511999999999" className="text-emerald-600 hover:text-emerald-700">(11) 99999-9999</a></div></div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"><Users className="w-6 h-6 text-emerald-600 flex-shrink-0" /><div><p className="font-semibold text-gray-900">Coordenador</p><p className="text-gray-700">Dr. João Silva</p></div></div>
                    </div>
                    <div className="mt-6"><button className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full">Enviar Mensagem</button></div>
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