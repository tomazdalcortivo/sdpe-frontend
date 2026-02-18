import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ allowedRoles }) {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user) {
        return <Navigate to="/entrar" replace />;
    }

    if (allowedRoles) {
        const temPermissao = allowedRoles.includes(user.perfil) || user.perfil === "ADMIN";

        if (!temPermissao) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
}