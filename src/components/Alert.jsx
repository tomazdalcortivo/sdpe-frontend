import { AlertCircle, CheckCircle } from "lucide-react";

export default function Alert({ type = "error", children }) {
    if (!children) return null;

    const config = {
        error: {
            style: "text-red-800 bg-red-50 border-red-200",
            icon: <AlertCircle size={20} className="shrink-0" />
        },
        success: {
            style: "text-green-800 bg-green-50 border-green-200",
            icon: <CheckCircle size={20} className="shrink-0" />
        }
    };

    const current = config[type] || config.error;

    return (
        <div className={`flex items-center gap-3 p-4 text-sm border rounded-md animate-fadeIn ${current.style}`}>
            {current.icon}
            <span>{children}</span>
        </div>
    );
}