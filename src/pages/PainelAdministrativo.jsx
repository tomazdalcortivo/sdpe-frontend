// import { useState, useEffect } from "react";
// import {
//   Users,
//   FolderKanban,
//   MessageSquare,
//   Edit,
//   Trash2,
//   Check,
//   X,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import api from "../services/api";

// export default function PainelAdministrativo() {

//   const [activeSection, setActiveSection] = useState("solicitacaoCadastros");
//   const [projetos, setProjetos] = useState([]);
//   const [loadingProjetos, setLoadingProjetos] = useState(false);
//   const [expandedItem, setExpandedItem] = useState(null);
//   const [erros, setErros] = useState([]);

//   const solicitacoes = [
//     { id: "solicitacaoCadastros", label: "Cadastros", icon: Users },
//     { id: "solicitacaoProjetos", label: "Projetos", icon: FolderKanban },
//     { id: "solicitacaoSuporte", label: "Suporte", icon: MessageSquare },
//   ];

//   const gerenciamento = [
//     { id: "gerenciamentoContas", label: "Contas", icon: Users },
//     { id: "gerenciamentoProjetos", label: "Projetos", icon: FolderKanban },
//   ];
  
//   const sectionConfig = {
//     solicitacaoCadastros: {
//       endpoint: ["/api/coordenadores", "/api/participantes"] //alterar para os que estão com status "Pendente"
//     },
//     solicitacaoProjetos: {
//       endpoint: ["/api/projetos"] //alterar para os que estão com status "Pendente"
//     },
//     solicitacaoSuporte: {
//       endpoint: ["/api/suporte"]
//     },
//     gerenciamentoContas: {
//       endpoint: ["/api/contas"] // contas já aprovadas
//     },
//     gerenciamentoProjetos: {
//       endpoint: ["/api/projetos"] // projetos já aprovados
//     }
    
//   };

//   async function buscarDados(section) {
//     setLoadingProjetos(true);
//     setErros(null);
    
//     try {
//     const responses = await Promise.all(
//       endpoints.map((url) => api.get(url))
//     );

//     const listas = responses.flatMap((res) => {
//       const data = res.data;
//       if (Array.isArray(data)) return data;
//       if (data?.content) return data.content;
//       return [];
//     });

//     setDados(listas);

//     } catch (err) {
//     console.error(err);
//     setErro("Erro ao carregar dados");
//   } finally {
//     setLoading(false);
//   }

//   useEffect(() => {
//   const config = sectionConfig[activeSection];
//   if (!config) return;

//   buscarDados(config.endpoints);
// }, [activeSection]);
  
//   return (
//     <section className="min-h-screen px-8 pt-40 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
//       <div className="mx-auto max-w-7xl">

//         <h1 className="mb-8 text-3xl font-bold text-slate-800">
//           Painel Administrativo
//         </h1>

//         <div className="flex gap-8">

//           {/* Menu lateral */}
//           <div className="w-64 space-y-8">
//             <div className="p-6 bg-white rounded-lg shadow">
//               <h2 className="mb-4 text-sm font-semibold uppercase text-slate-500">
//                 Solicitações
//               </h2>

//               {solicitacoes.map((section) => {
//                 const Icon = section.icon;
//                 return (
//                   <button
//                     key={section.id}
//                     onClick={() => setActiveSection(section.id)}
//                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-md
//                       ${activeSection === section.id
//                         ? "bg-emerald-600 text-white"
//                         : "text-slate-700 hover:bg-emerald-50"
//                       }`}
//                   >
//                     <Icon size={18} />
//                     {section.label}
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="p-6 bg-white rounded-lg shadow">
//               <h2 className="mb-4 text-sm font-semibold uppercase text-slate-500">
//                 Gerenciamento
//               </h2>

//               {gerenciamento.map((section) => {
//                 const Icon = section.icon;
//                 return (
//                   <button
//                     key={section.id}
//                     onClick={() => setActiveSection(section.id)}
//                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-md
//                       ${activeSection === section.id
//                         ? "bg-emerald-600 text-white"
//                         : "text-slate-700 hover:bg-emerald-50"
//                       }`}
//                   >
//                     <Icon size={18} />
//                     {section.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* CONTEÚDO */}
//           <div className="flex-1 p-8 bg-white rounded-lg shadow">

//             {activeSection === "solicitacaoProjetos" && (
//               <>
//                 <h2 className="mb-6 text-2xl font-bold">
//                   Solicitações de Projetos
//                 </h2>

//                 {loadingProjetos && <p>Carregando...</p>}

//                 {!loadingProjetos && projetos.length === 0 && (
//                   <p className="text-slate-500">Nenhum projeto encontrado.</p>
//                 )}

//                 <div className="space-y-3">
//                   {projetos.map((request) => (
//                     <div
//                       key={request.id}
//                       className="p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
//                       onClick={() =>
//                         setExpandedItem(
//                           expandedItem === request.id ? null : request.id
//                         )
//                       }
//                     >
//                       <div className="flex items-center gap-4">
//                         {expandedItem === request.id
//                           ? <ChevronDown size={20} />
//                           : <ChevronRight size={20} />
//                         }

//                         <div>
//                           <h3 className="font-semibold">
//                             {request.nome}
//                           </h3>
//                           <p className="text-sm text-slate-500">
//                             {request.email || "—"}
//                           </p>
//                         </div>
//                       </div>

//                       {expandedItem === request.id && (
//                         <div className="flex gap-3 mt-4">
//                           <button className="px-4 py-2 text-white rounded bg-emerald-600">
//                             <Check size={16} /> Aprovar
//                           </button>
//                           <button className="px-4 py-2 text-white bg-red-600 rounded">
//                             <X size={16} /> Recusar
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }