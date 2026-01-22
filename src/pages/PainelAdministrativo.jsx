import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Users, FolderKanban, MessageSquare,
    Check, X, ChevronDown, ChevronRight,
    FileText, Shield, Ban, Trash2, Eye
} from "lucide-react";
import api from "../services/api";

export default function PainelAdministrativo() {

    const [activeSection, setActiveSection] = useState("solicitacaoCadastros");
    const [listaDados, setListaDados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const [erro, setErro] = useState(null);

    // Configuração do Menu Lateral
    const solicitacoes = [
        { id: "solicitacaoCadastros", label: "Cadastros Pendentes", icon: Users },
        // { id: "solicitacaoSuporte", label: "Suporte", icon: MessageSquare }, // Exemplo futuro
    ];

    const gerenciamento = [
        { id: "gerenciamentoContas", label: "Todas as Contas", icon: Shield },
        { id: "gerenciamentoProjetos", label: "Todos os Projetos", icon: FolderKanban },
    ];

    // Configuração dos Endpoints para cada seção
    const sectionConfig = {
        solicitacaoCadastros: {
            url: "/api/admin/solicitacoes-pendentes",
            type: "participante"
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

    // --- FUNÇÕES DE DADOS ---

    async function buscarDados() {
        const config = sectionConfig[activeSection];
        if (!config) return;

        setLoading(true);
        setErro(null);
        setListaDados([]);

        try {
            const res = await api.get(config.url);
            console.log("Dados recebidos:", res.data); // Log para debug

            // Tratamento para paginação (Page) ou Lista direta (List)
            const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
            setListaDados(data);
        } catch (err) {
            console.error(err);
            setErro("Erro ao carregar dados. Verifique sua permissão ou conexão.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setExpandedItem(null); // Fecha item expandido ao trocar de aba
        buscarDados();
    }, [activeSection]);

    // --- AÇÕES DO ADMINISTRADOR ---

    // Excluir Projeto
    async function handleExcluirProjeto(idProjeto) {
        if (!confirm("ATENÇÃO: Isso excluirá o projeto permanentemente e não poderá ser desfeito. Deseja continuar?")) return;

        try {
            await api.delete(`/api/admin/projetos/${idProjeto}`);
            alert("Projeto excluído com sucesso.");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir projeto. Verifique se existem vínculos.");
        }
    }

    // Aprovar Cadastro ou Reativar Conta
    async function handleAprovar(idConta) {
        try {
            await api.patch(`/api/admin/contas/${idConta}/status`, null, {
                params: { ativo: true }
            });
            alert("Conta ativada com sucesso!");
            buscarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao processar solicitação.");
        }
    }

    // Excluir Conta (Definitivamente)
    async function handleExcluir(idConta) {
        if (!confirm("Tem certeza? Essa ação excluirá a conta, o perfil e todos os projetos deste usuário (se for coordenador).")) return;

        try {
            await api.delete(`/api/admin/contas/${idConta}`);
            alert("Conta e dados vinculados excluídos com sucesso.");
            buscarDados();
        } catch (error) {
            console.error(error);
            // Se o backend enviar mensagem específica de erro
            if (error.response?.data?.error) {
                alert("Erro: " + error.response.data.error);
            } else {
                alert("Erro ao excluir conta.");
            }
        }
    }

    // Bloquear Conta
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

    // --- HELPERS DE RENDERIZAÇÃO ---

    const getItemTitle = (item) => {
        if (activeSection === "gerenciamentoProjetos") return item.nome;
        return item.nome || "Utilizador sem nome";
    };

    const getItemSubtitle = (item) => {
        if (activeSection === "gerenciamentoProjetos") {
            return `Área: ${item.area || "Geral"}`;
        }
        const email = item.conta?.email || "Sem email";
        const perfil = item.conta?.perfil || "USER";
        return `${email} • ${perfil}`;
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
        } else {
            return (
                <div className="hidden md:block text-right mr-4">
                    <span className="text-xs text-gray-400 font-semibold block uppercase">CPF</span>
                    <span className="text-sm font-mono text-slate-700">
                        {item.cpf || "Não informado"}
                    </span>
                </div>
            );
        }
    };

    return (
        <section className="min-h-screen px-4 md:px-8 pt-28 pb-12 bg-gray-50">
            <div className="mx-auto max-w-7xl">

                <h1 className="mb-8 text-3xl font-bold text-emerald-900">
                    Painel Administrativo
                </h1>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* === SIDEBAR (MENU) === */}
                    <div className="w-full md:w-64 space-y-6 shrink-0">

                        {/* Grupo Solicitações */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                    Solicitações
                                </h2>
                            </div>
                            <div className="p-2">
                                {solicitacoes.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${activeSection === section.id
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                                        >
                                            <Icon size={18} />
                                            {section.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grupo Gerenciamento */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                    Gerenciamento
                                </h2>
                            </div>
                            <div className="p-2">
                                {gerenciamento.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${activeSection === section.id
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                                        >
                                            <Icon size={18} />
                                            {section.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* === ÁREA DE CONTEÚDO === */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">

                        {/* Cabeçalho da Lista */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                            <h3 className="font-semibold text-gray-800">
                                {solicitacoes.find(s => s.id === activeSection)?.label ||
                                    gerenciamento.find(s => s.id === activeSection)?.label}
                            </h3>
                            <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">
                                {listaDados.length} registros
                            </span>
                        </div>

                        <div className="p-6">
                            {loading && (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            )}

                            {erro && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                                    {erro}
                                </div>
                            )}

                            {!loading && !erro && listaDados.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <FolderKanban size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Nenhum registro encontrado nesta seção.</p>
                                </div>
                            )}

                            {/* LISTA DE ITENS */}
                            <div className="space-y-3">
                                {listaDados.map((item, index) => {
                                    const itemId = item.id || index;
                                    const isExpanded = expandedItem === itemId;
                                    // Se for projeto, usa item.id, se for participante, usa item.conta.id
                                    const accountId = item.conta?.id;

                                    return (
                                        <div
                                            key={itemId}
                                            className={`border rounded-lg transition-all duration-200 
                                            ${isExpanded ? 'border-emerald-200 bg-emerald-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <div
                                                className="p-4 cursor-pointer flex items-center gap-4"
                                                onClick={() => setExpandedItem(isExpanded ? null : itemId)}
                                            >
                                                {/* Seta */}
                                                <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown size={20} />
                                                </div>

                                                {/* Info Principal */}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {getItemTitle(item)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        {getItemSubtitle(item)}
                                                    </p>
                                                </div>

                                                {/* Info Extra (CPF ou Coords) */}
                                                {renderExtraInfo(item)}

                                                {/* Status Badge (apenas para contas/usuarios) */}
                                                {activeSection !== "gerenciamentoProjetos" && (
                                                    item.conta?.ativo ?
                                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ATIVO</span> :
                                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">INATIVO</span>
                                                )}

                                                {/* Badge PENDENTE */}
                                                {activeSection === "solicitacaoCadastros" && (
                                                    <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                                                        PENDENTE
                                                    </span>
                                                )}
                                            </div>

                                            {/* ÁREA EXPANDIDA (AÇÕES) */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 pt-0 pl-12">

                                                    {/* SE FOR PROJETO */}
                                                    {activeSection === "gerenciamentoProjetos" ? (
                                                        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3">
                                                            <Link
                                                                to={`/detalhes-projeto/${item.id}`}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors"
                                                            >
                                                                <Eye size={16} /> Ver Página do Projeto
                                                            </Link>

                                                            <button
                                                                onClick={() => handleExcluirProjeto(item.id)}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm ml-auto"
                                                            >
                                                                <Trash2 size={16} /> Excluir Projeto
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* SE FOR CONTA OU CADASTRO PENDENTE */
                                                        <div>
                                                            {/* Documento (se houver) */}
                                                            {item.documentoUrl && (
                                                                <div className="mb-4">
                                                                    <a
                                                                        href={item.documentoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded"
                                                                    >
                                                                        <FileText size={14} />
                                                                        Ver Documento Comprobatório
                                                                    </a>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-3">
                                                                {activeSection === "solicitacaoCadastros" ? (
                                                                    /* AÇÕES PENDENTES */
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleAprovar(accountId)}
                                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                                                                        >
                                                                            <Check size={16} /> Aprovar Cadastro
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleExcluir(accountId)}
                                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                                                                        >
                                                                            <X size={16} /> Rejeitar
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    /* AÇÕES GERENCIAMENTO CONTAS */
                                                                    <>
                                                                        {item.conta?.ativo === true ? (
                                                                            <button
                                                                                onClick={() => handleBloquear(accountId)}
                                                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
                                                                            >
                                                                                <Ban size={16} /> Bloquear Conta
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleAprovar(accountId)}
                                                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors"
                                                                            >
                                                                                <Check size={16} /> Reativar Conta
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => handleExcluir(accountId)}
                                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-red-600 transition-colors ml-auto"
                                                                        >
                                                                            <X size={16} /> Excluir Definitivamente
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