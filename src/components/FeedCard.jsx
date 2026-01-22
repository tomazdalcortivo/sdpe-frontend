import { useState } from "react";
import { Users, ExternalLink, Share2, User, Check, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function FeedCard({ post }) {
    const [seguindo, setSeguindo] = useState(post.seguindo);
    const [totalSeguidores, setTotalSeguidores] = useState(post.totalSeguidores);
    const [loadingAction, setLoadingAction] = useState(false);
    const [linkCopiado, setLinkCopiado] = useState(false);
    const [imgError, setImgError] = useState(false);

    const imageUrl = `http://localhost:8080/api/projetos/${post.id}/imagem`;

    async function handleSeguir() {
        if (loadingAction) return;
        setLoadingAction(true);

        const novoStatus = !seguindo;
        setSeguindo(novoStatus);
        setTotalSeguidores(prev => novoStatus ? prev + 1 : prev - 1);

        try {
            await api.post(`/api/feed/${post.id}/seguir`);
        } catch (error) {
            setSeguindo(!novoStatus);
            setTotalSeguidores(prev => !novoStatus ? prev + 1 : prev - 1);
        } finally {
            setLoadingAction(false);
        }
    }

    const handleCompartilhar = async () => {
        const linkDoProjeto = `${window.location.origin}/detalhes-projeto/${post.id}`;
        try {
            await navigator.clipboard.writeText(linkDoProjeto);
            setLinkCopiado(true);
            setTimeout(() => setLinkCopiado(false), 2000);
        } catch (err) {
            alert("Não foi possível copiar o link.");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden hover:shadow-md transition-shadow relative">

            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <User size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 text-sm truncate max-w-[200px] sm:max-w-xs"
                            title={post.autorNome}
                        >
                            {post.autorNome}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {post.dataPublicacao ? new Date(post.dataPublicacao).toLocaleDateString() : "Data não inf."}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSeguir}
                    disabled={loadingAction}
                    className={`px-4 py-1.5 shrink-0 rounded-full text-sm font-semibold transition-all flex items-center gap-2
            ${seguindo
                            ? "bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        }`}
                >
                    {seguindo ? (
                        <>
                            <span className="hidden sm:inline">Seguindo</span>
                            <span className="sm:hidden"><Check size={16} /></span>
                        </>
                    ) : (
                        <>Seguir</>
                    )}
                </button>
            </div>

            {!imgError ? (
                <div className="relative w-full bg-gray-100">
                    <div className="aspect-video w-full">
                        <img
                            src={imageUrl}
                            alt={post.titulo}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    </div>
                </div>
            ) : (
                <div className="h-24 bg-gradient-to-r from-emerald-50 to-teal-50 border-y border-emerald-100 flex items-center justify-center px-4 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 text-emerald-100 opacity-50">
                        <ImageOff size={100} />
                    </div>
                    <span className="text-emerald-800 font-medium opacity-80 z-10 flex items-center gap-2">
                        <ImageOff size={18} />
                        Projeto sem capa disponível
                    </span>
                </div>
            )}

            <div className="p-4">
                <div className="mb-4">
                    <h4 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                        {post.titulo}
                    </h4>

                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed" title={post.descricao}>
                        {post.descricao}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={16} />
                        <span><strong>{totalSeguidores}</strong> seguidores</span>
                    </div>

                    <div className="flex gap-1 items-center">

                        <Link
                            to={`/detalhes-projeto/${post.id}`}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition"
                            title="Acessar página do projeto"
                        >
                            <ExternalLink size={22} />
                        </Link>

                        <button
                            onClick={handleCompartilhar}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition relative"
                            title="Copiar link"
                        >
                            {linkCopiado ? (
                                <Check size={22} className="text-emerald-600 stroke-[3]" />
                            ) : (
                                <Share2 size={22} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}