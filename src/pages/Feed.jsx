import { useState, useEffect } from "react";
import api from "../services/api";
import FeedCard from "../components/FeedCard";

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeed() {
            try {
                const res = await api.get("/api/feed?page=0&size=10");
                setPosts(res.data.content || []);
            } catch (error) {
                console.error("Erro ao carregar feed", error);
            } finally {
                setLoading(false);
            }
        }
        loadFeed();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl font-bold text-emerald-900 mb-6 text-center">
                    Feed de Projetos
                </h1>

                {loading ? (
                    <div className="text-center py-10">Carregando feed...</div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <FeedCard key={post.id} post={post} />
                        ))}
                        {posts.length === 0 && <p className="text-center text-gray-500">Nenhum projeto encontrado.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}