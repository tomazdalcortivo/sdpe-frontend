import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";

export default function AjudaButton() {
  return (
    <div className="fixed z-50 bottom-6 right-6">
        <Link
          to="/Ajuda"
          className="flex items-center gap-2 p-4 text-white transition rounded-full shadow-lg bg-emerald-900 hover:bg-emerald-600">
          <HelpCircle />
        </Link>
      </div>
  );
}
