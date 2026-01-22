import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Users, FolderKanban, MessageSquare,
    Check, X, ChevronDown,
    FileText, Shield, Ban, Trash2, Eye, Mail
} from "lucide-react";
import api from "../services/api";

export default function PainelAdministrativo() {

    const [activeSection, setActiveSection] = useState("solicitacaoCadastros");
    const [listaDados, setListaDados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const [erro, setErro] = useState(null);

    // --- CONFIGURAÇÃO DO MENU ---
    const solicitacoes = [
        { id: "solicitacaoCadastros", label: "Cadastros Pendentes", icon: Users },
        { id: "solicitacaoSuporte", label: "Suporte & Contato", icon: MessageSquare },
    ];

    const gerenciamento = [
        { id: "gerenciamentoContas", label: "Todas as Contas", icon: Shield },
        { id: "gerenciamentoProjetos", label: "Todos os Projetos", icon: FolderKanban },
    ];

    // --- CONFIGURAÇÃO DOS ENDPOINTS ---
    const sectionConfig = {
        solicitacaoCadastros: {
            url: "/api/admin/solicitacoes-pendentes",
            type: "participante"
        },
        solicitacaoSuporte: {
            url: "/api/admin/contatos",
            type: "contato"
        },
        gerenciamentoContas: {
            url: "/api/admin/contas",
            type: "participante"
        },
        gerenciamentoProjetos: {
            url: "/api/admin/projetos",
            type: "projeto"
        }
    };

    // --- CARREGAMENTO DE DADOS ---

    async function buscarDados() {
        const config = sectionConfig[activeSection];
        if (!config) return;

        setLoading(true);
        setErro(null);
        setListaDados([]);

        try {
            const res = await api.get(config.url);
            // Garante que é um array, mesmo que venha paginado (Page) ou lista direta (List)
            const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
            setListaDados(data);
        } catch (err) {
            console.error(err);
            setErro("Erro ao carregar dados. Verifique se o backend está a rodar e se é Admin.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setExpandedItem(null);
        buscarDados();
    }, [activeSection]);

    // --- FUNÇÕES DE AÇÃO ---

    // 1. Excluir Projeto
    async function handleExcluirProjeto(idProjeto) {
        if (!confirm("ATENÇÃO: Isso excluirá o projeto, arquivos, visualizações e contatos vinculados. Não pode ser desfeito. Continuar?")) return;

        try {
            await api.delete(`/api/admin/projetos/${idProjeto}`);
            alert("Projeto excluído com sucesso.");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir projeto.");
        }
    }

    // 2. Aprovar Cadastro ou Reativar Conta
    async function handleAprovar(idConta) {
        try {
            await api.patch(`/api/admin/contas/${idConta}/status`, null, {
                params: { ativo: true }
            });
            alert("Conta ativada com sucesso!");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao ativar conta.");
        }
    }

    // 3. Bloquear Conta
    async function handleBloquear(idConta) {
        try {
            await api.patch(`/api/admin/contas/${idConta}/status`, null, {
                params: { ativo: false }
            });
            alert("Conta bloqueada.");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao bloquear conta.");
        }
    }

    // 4. Excluir Conta (Definitivamente)
    async function handleExcluir(idConta) {
        if (!confirm("Tem a certeza? Isso excluirá a conta, o perfil e TODOS os projetos deste utilizador (se for coordenador).")) return;

        try {
            await api.delete(`/api/admin/contas/${idConta}`);
            alert("Conta e dados excluídos.");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir conta.");
        }
    }

    // --- HELPERS DE RENDERIZAÇÃO ---

    const getItemTitle = (item) => {
        if (activeSection === "gerenciamentoProjetos") return item.nome;
        if (activeSection === "solicitacaoSuporte") return item.nome || "Anônimo";
        return item.nome || "Utilizador sem nome";
    };

    const getItemSubtitle = (item) => {
        if (activeSection === "gerenciamentoProjetos") return `Área: ${item.area || "Geral"}`;

        if (activeSection === "solicitacaoSuporte") {
            const data = item.dataEnvio ? new Date(item.dataEnvio).toLocaleDateString() : "";
            return item.email + (data ? ` • ${data}` : "");
        }

        const email = item.conta?.email || "Sem email";
        const perfil = item.conta?.perfil || "USER";
        return `${email} • ${perfil}`;
    };

    const renderContatoBadge = (tipo) => {
        const cores = {
            CHAMADO: "bg-red-100 text-red-700",
            DUVIDA: "bg-blue-100 text-blue-700",
            SUGESTAO: "bg-green-100 text-green-700",
            FEEDBACK: "bg-purple-100 text-purple-700",
            OUTRO: "bg-gray-100 text-gray-700"
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${cores[tipo] || cores.OUTRO}`}>
                {tipo}
            </span>
        );
    };

    const renderExtraInfo = (item) => {
        if (activeSection === "gerenciamentoProjetos") {
            const nomesCoords = item.coordenadores?.map(c => c.nome).join(", ") || "Sem coordenador";
            return (
                <div className="hidden md:block text-right mr-4">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">Responsáveis</span>
                    <span className="text-sm text-slate-700 truncate max-w-[200px] block" title={nomesCoords}>
                        {nomesCoords}
                    </span>
                </div>
            );
        } else if (activeSection !== "solicitacaoSuporte") {
            return (
                <div className="hidden md:block text-right mr-4">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">CPF</span>
                    <span className="text-sm font-mono text-slate-700">
                        {item.cpf || "—"}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <section className="min-h-screen px-4 md:px-8 pt-28 pb-12 bg-gray-50">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold text-emerald-900">
                    Painel Administrativo
                </h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* MENU LATERAL */}
                    <div className="w-full md:w-64 space-y-6 shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Solicitações</h2>
                            </div>
                            <div className="p-2">
                                {solicitacoes.map((s) => (
                                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}>
                                        <s.icon size={18} /> {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Gerenciamento</h2>
                            </div>
                            <div className="p-2">
                                {gerenciamento.map((s) => (
                                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
                                        <s.icon size={18} /> {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CONTEÚDO */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="font-semibold text-gray-800">
                                {solicitacoes.find(s => s.id === activeSection)?.label || gerenciamento.find(s => s.id === activeSection)?.label}
                            </h3>
                            <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">{listaDados.length} registros</span>
                        </div>

                        <div className="p-6">
                            {loading && (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            )}

                            {erro && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{erro}</div>
                            )}

                            {!loading && !erro && listaDados.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <FolderKanban size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Nenhum registro encontrado nesta seção.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {listaDados.map((item, index) => {
                                    const itemId = item.id || index;
                                    const isExpanded = expandedItem === itemId;
                                    const accountId = item.conta?.id; // ID para deletar/ativar conta

                                    return (
                                        <div key={itemId} className={`border rounded-lg transition-all ${isExpanded ? 'border-emerald-200 bg-emerald-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                                            <div className="p-4 cursor-pointer flex items-center gap-4" onClick={() => setExpandedItem(isExpanded ? null : itemId)}>
                                                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />

                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">{getItemTitle(item)}</h3>
                                                    <p className="text-sm text-gray-500">{getItemSubtitle(item)}</p>
                                                </div>

                                                {renderExtraInfo(item)}
                                                {activeSection === "solicitacaoSuporte" && renderContatoBadge(item.tipoContato)}

                                                {/* Status Badges para Contas */}
                                                {activeSection === "solicitacaoCadastros" && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">PENDENTE</span>}
                                                {(activeSection === "gerenciamentoContas" && item.conta?.ativo) && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ATIVO</span>}
                                                {(activeSection === "gerenciamentoContas" && !item.conta?.ativo) && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">INATIVO</span>}
                                            </div>

                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-0 pl-12">
                                                    {/* SEÇÃO DE SUPORTE */}
                                                    {activeSection === "solicitacaoSuporte" ? (
                                                        <div className="bg-white p-4 rounded border border-gray-200 mt-2">
                                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">"{item.mensagem}"</p>
                                                            <div className="mt-4 flex gap-2">
                                                                <a href={`mailto:${item.email}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
                                                                    <Mail size={16} /> Responder por Email
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // AÇÕES GERAIS (Botões Recuperados)
                                                        <div>
                                                            {/* Documento se existir */}
                                                            {item.documentoUrl && (
                                                                <div className="mb-4">
                                                                    <a href={item.documentoUrl} target="_blank" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded">
                                                                        <FileText size={14} /> Ver Documento
                                                                    </a>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3">
                                                                {/* PROJETOS */}
                                                                {activeSection === "gerenciamentoProjetos" && (
                                                                    <>
                                                                        <Link to={`/detalhes-projeto/${item.id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200">
                                                                            <Eye size={16} /> Ver Projeto
                                                                        </Link>
                                                                        <button onClick={() => handleExcluirProjeto(item.id)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 ml-auto">
                                                                            <Trash2 size={16} /> Excluir Projeto
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* CADASTROS PENDENTES */}
                                                                {activeSection === "solicitacaoCadastros" && (
                                                                    <>
                                                                        <button onClick={() => handleAprovar(accountId)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
                                                                            <Check size={16} /> Aprovar
                                                                        </button>
                                                                        <button onClick={() => handleExcluir(accountId)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50">
                                                                            <X size={16} /> Rejeitar
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* GERENCIAMENTO CONTAS */}
                                                                {activeSection === "gerenciamentoContas" && (
                                                                    <>
                                                                        {item.conta?.ativo ? (
                                                                            <button onClick={() => handleBloquear(accountId)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200">
                                                                                <Ban size={16} /> Bloquear
                                                                            </button>
                                                                        ) : (
                                                                            <button onClick={() => handleAprovar(accountId)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200">
                                                                                <Check size={16} /> Reativar
                                                                            </button>
                                                                        )}
                                                                        <button onClick={() => handleExcluir(accountId)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-red-600 ml-auto">
                                                                            <X size={16} /> Excluir Conta
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}