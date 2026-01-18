import React, { useState } from 'react';
import {
  ArrowLeft, Edit2, Calendar, Clock, Users, Target, BookOpen, MapPin, Globe,
  Facebook, Instagram, Linkedin, Youtube, Upload, X, FileText, Image as ImageIcon,
  Video, MessageSquare, Mail, Phone
} from 'lucide-react';

export default function DetalhesProjeto({ projectId, onBack, isOwner = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const project = projects.find(p => p.id === projectId);

  const [editData, setEditData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    area: project?.category || '',
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    workload: '120 horas',
    format: 'Híbrido',
    planning:
      'O projeto visa desenvolver soluções inovadoras através de pesquisa aplicada e extensão universitária, promovendo a integração entre academia e comunidade.',
    participants: ['Dr. João Silva (Coordenador)', 'Maria Santos (Pesquisadora)', '15 alunos voluntários'],
    socialMedia: {
      website: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    images: [],
    videos: [],
    documents: []
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">Projeto não encontrado</p>
          <button onClick={onBack} className="mt-4 text-emerald-600 hover:text-emerald-700">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && editData.images.length < 10) {
      const newImages = Array.from(files)
        .slice(0, 10 - editData.images.length)
        .map(f => URL.createObjectURL(f));
      setEditData({ ...editData, images: [...editData.images, ...newImages] });
    }
  };

  const handleVideoUpload = (e) => {
    const files = e.target.files;
    if (files && editData.videos.length < 5) {
      const newVideos = Array.from(files)
        .slice(0, 5 - editData.videos.length)
        .map(f => f.name);
      setEditData({ ...editData, videos: [...editData.videos, ...newVideos] });
    }
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (files && editData.documents.length < 10) {
      const newDocs = Array.from(files)
        .slice(0, 10 - editData.documents.length)
        .map(f => f.name);
      setEditData({ ...editData, documents: [...editData.documents, ...newDocs] });
    }
  };

  const removeItem = (type, index) => {
    setEditData({
      ...editData,
      [type]: editData[type].filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-80 overflow-hidden">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-3xl md:text-4xl font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg w-full"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                  {project.category}
                </span>
                <span className="text-sm opacity-90">Em andamento</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                  }`}
              >
                <Edit2 className="w-5 h-5" />
                {isEditing ? 'Cancelar Edição' : 'Editar Projeto'}
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'multimedia', 'documents', 'feedback'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-300 border-b-2 ${activeTab === tab
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                    }`}
                >
                  {tab === 'overview' && 'Visão Geral'}
                  {tab === 'multimedia' && 'Multimídia'}
                  {tab === 'documents' && 'Editais'}
                  {tab === 'feedback' && 'Feedback'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
