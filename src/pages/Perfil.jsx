import { useState } from "react";
import { Link } from "react-router-dom";
import {Camera, Edit2, Trash2, Save, X, Briefcase, Mail, MapPin} from "lucide-react";

export default function Perfil() {

  // Estado do usuário e perfil
 
  const [role] = useState("PROFESSOR"); // valor de teste (precisa mudar!!!)
  const isProfessor = role === "PROFESSOR"; 

  const [isEditing, setIsEditing] = useState(false);
  const [projectTab, setProjectTab] = useState("created");

  const [profileImage, setProfileImage] = useState(
    "src/assets/imagem_perfil.png"
  );

  const [userData, setUserData] = useState({
    name: "Nome do usuário",
    email: "email@teste.com",
    phone: "",
    department: "Departamento / Curso",
    bio: "Descreva-se aqui...",
    location: "Cidade, Estado",
  });

  // Projetos de teste
  const createdProjects = [];
  const participatedProjects = [];
  const currentProjects =
    projectTab === "created" ? createdProjects : participatedProjects;

  //Funcoes de teste
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="max-w-6xl mx-auto">
        {/* Card do perfil */}
        <div className="relative mb-10 overflow-hidden bg-white rounded-lg shadow">
          {/* HEADER VERDE */}
          <div className="h-40 bg-linear-to-r from-emerald-700 to-emerald-500"></div>

          {/* BOTÃO EDITAR (canto direito) */}
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2 text-white rounded-md shadow bg-emerald-900 hover:bg-emerald-700"
              >
                <Edit2 size={16} />
                Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save size={16} />
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* CONTEÚDO */}
          <div className="px-8 pb-8">
            {/* FOTO + NOME */}
            <div
              className={`flex flex-col items-end gap-6 mb-6 -mt-20 md:flex-row ${
                isEditing ? "mt-7" : "-mt-20"
              }`}
            >
              <div className="relative group">
                <img
                  src={profileImage}
                  alt="Perfil"
                  className="object-cover w-40 h-40 border-4 border-white rounded-lg shadow"
                />
                <label className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100">
                  <Camera className="text-white" />
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>
              </div>

              <div className="flex-1 space-y-2">
                {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-slate-600">{userData.department}</p>
                  </>
                ) : (
                  <>
                    <input
                      className="w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500"
                      placeholder="Nome completo"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                    <input
                      className="w-full px-4 py-2 border rounded-md outline-none focus:border-emerald-500"
                      placeholder="Departamento / Curso"
                      value={userData.department}
                      onChange={(e) =>
                        setUserData({ ...userData, department: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* CONTATOS */}
            <div className="grid gap-4 mb-6 md:grid-cols-3 text-slate-600">
              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="text-emerald-600" size={18} />
                {!isEditing ? (
                  <span>{userData.email || "-"}</span>
                ) : (
                  <input
                    className="w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500"
                    placeholder="Email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                  />
                )}
              </div>

              {/* Localizacao */}
              <div className="flex items-center gap-2">
                <MapPin className="text-emerald-600" size={18} />
                {!isEditing ? (
                  <span>{userData.location || "-"}</span>
                ) : (
                  <input
                    className="w-full px-2 py-1 border rounded-md outline-none focus:border-emerald-500"
                    placeholder="Cidade / Estado"
                    value={userData.location}
                    onChange={(e) =>
                      setUserData({ ...userData, location: e.target.value })
                    }
                  />
                )}
              </div>
            </div>

            {/* BIO */}
            <div>
              <label className="block mb-1 font-medium">Sobre mim:</label>
              {!isEditing ? (
                <p className="text-slate-600">{userData.bio}</p>
              ) : (
                <textarea
                  className="w-full px-4 py-2 border rounded-md"
                  rows="3"
                  value={userData.bio}
                  onChange={(e) =>
                    setUserData({ ...userData, bio: e.target.value })
                  }
                />
              )}
            </div>

            {/* BOTÃO CRIAR PROJETO (somente professor) */}
            {isProfessor && !isEditing && (
              <div className="flex justify-end mt-4">
                <Link
                  to="/criarprojeto"
                  className="px-6 py-2 text-sm font-medium text-white transition rounded-md shadow bg-emerald-600 hover:bg-emerald-700"
                >
                  + Criar novo projeto
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MEUS PROJETOS */}
        <div className="p-8 mb-10 bg-white rounded-lg shadow">
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold">
            <Briefcase className="text-emerald-600" />
            Meus Projetos
          </h2>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setProjectTab("created")}
              className={`px-5 py-2 rounded-md ${
                projectTab === "created"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Criados
            </button>
            <button
              onClick={() => setProjectTab("participated")}
              className={`px-5 py-2 rounded-md ${
                projectTab === "participated"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Participados
            </button>
          </div>

          {currentProjects.length === 0 && (
            <p className="text-center text-slate-500">
              Nenhum projeto encontrado.
            </p>
          )}
        </div>

        {/* BOTÃO EXCLUIR CONTA */}
        <div className="flex justify-end mt-4">
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-red-600 rounded-md shadow hover:bg-red-700">
            <Trash2 size={16} />
            Excluir conta
          </button>
        </div>
      </div>
    </section>
  );
}
