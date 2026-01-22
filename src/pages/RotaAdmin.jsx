import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

export default function RotaAdmin() {
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const verificarPermissao = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setIsAdmin(false);
                return;
            }

            try {
                const response = await api.get("/auth/perfil");
                if (response.data.perfil === "ADMIN") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Erro ao validar permissão de admin", error);
                setIsAdmin(false);
            }
        };

        verificarPermissao();
    }, []);

    if (isAdmin === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }


    return isAdmin ? <Outlet /> : <Navigate to="/entrar" replace />;
}