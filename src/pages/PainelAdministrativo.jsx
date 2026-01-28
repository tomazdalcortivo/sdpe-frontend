import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  MessageSquare,
  Check,
  X,
  ChevronDown,
  FileText,
  Shield,
  Ban,
  Trash2,
  Eye,
  Mail,
} from "lucide-react";
import api from "../services/api";

export default function PainelAdministrativo() {
  const [activeSection, setActiveSection] = useState("solicitacaoCadastros");
  const [documentoVisivel, setDocumentoVisivel] = useState(null);
  const [listaDados, setListaDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [erro, setErro] = useState(null);

  const solicitacoes = [
    { id: "solicitacaoCadastros", label: "Cadastros Pendentes", icon: Users },
    {
      id: "solicitacaoProjetos",
      label: "Projetos Pendentes",
      icon: FolderKanban,
    },
    {
      id: "solicitacaoSuporte",
      label: "Suporte & Contato",
      icon: MessageSquare,
    },
  ];

  const gerenciamento = [
    { id: "gerenciamentoContas", label: "Todas as Contas", icon: Shield },
    {
      id: "gerenciamentoProjetos",
      label: "Todos os Projetos",
      icon: FolderKanban,
    },
  ];

  const sectionConfig = {
    solicitacaoCadastros: {
      url: "/api/admin/solicitacoes-pendentes",
      type: "participante",
    },
    solicitacaoProjetos: {
      url: "/api/admin/projetos-pendentes",
      type: "projeto",
    },
    solicitacaoSuporte: {
      url: "/api/admin/contatos",
      type: "contato",
    },
    gerenciamentoContas: {
      url: "/api/admin/contas",
      type: "participante",
    },
    gerenciamentoProjetos: {
      url: "/api/admin/projetos",
      type: "projeto",
    },
  };

  async function buscarDados() {
    const config = sectionConfig[activeSection];
    if (!config) return;

    setLoading(true);
    setErro(null);
    setListaDados([]);

    try {
      const res = await api.get(config.url);
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setListaDados(data);
    } catch (err) {
      console.error(err);
      setErro(
        "Erro ao carregar dados. Verifique se o backend está a rodar e se é Admin.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setExpandedItem(null);
    buscarDados();
  }, [activeSection]);

  async function handleExcluirProjeto(idProjeto) {
    if (
      !confirm(
        "ATENÇÃO: Isso excluirá o projeto, arquivos, visualizações e contatos vinculados. Não pode ser desfeito. Continuar?",
      )
    )
      return;

    try {
      await api.delete(`/api/admin/projetos/${idProjeto}`);
      alert("Projeto excluído com sucesso.");
      buscarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir projeto.");
    }
  }

  async function handleAprovarProjeto(idProjeto) {
    try {
      await api.patch(`/api/admin/projetos/${idProjeto}/status`, null, {
        params: { ativo: true },
      });
      alert("Projeto aprovado com sucesso!");
      buscarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao aprovar projeto.");
    }
  }

  async function handleRejeitarProjeto(idProjeto) {
    const motivo = window.prompt(
      "Motivo da rejeição (será exibido ao coordenador):",
    );
    if (motivo === null) return;
    if (motivo.trim() === "") return alert("Motivo obrigatório.");

    try {
      await api.patch(`/api/admin/projetos/${idProjeto}/rejeitar`, { motivo });
      alert("Projeto rejeitado e notificação enviada.");
      buscarDados();
    } catch (error) {
      alert("Erro ao rejeitar.");
    }
  }

  async function handleAprovar(idConta) {
    try {
      await api.patch(`/api/admin/contas/${idConta}/status`, null, {
        params: { ativo: true },
      });
      alert("Conta ativada com sucesso!");
      buscarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao ativar conta.");
    }
  }

  async function handleBloquear(idConta) {
    try {
      await api.patch(`/api/admin/contas/${idConta}/status`, null, {
        params: { ativo: false },
      });
      alert("Conta bloqueada.");
      buscarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao bloquear conta.");
    }
  }

  async function handleExcluir(idConta) {
    if (
      !confirm(
        "Tem a certeza? Isso excluirá a conta, o perfil e TODOS os projetos deste utilizador (se for coordenador).",
      )
    )
      return;

    try {
      await api.delete(`/api/admin/contas/${idConta}`);
      alert("Conta e dados excluídos.");
      buscarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir conta.");
    }
  }

  async function handleResponderContato(item) {
    const { value: textoResposta } = await Swal.fire({
      title: `Responder a ${item.nome}`,
      input: "textarea",
      inputLabel: `Para: ${item.email}`,
      inputPlaceholder: "Escreva a sua resposta aqui...",
      inputAttributes: {
        "aria-label": "Escreva a sua resposta aqui",
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Email <i class="fa fa-paper-plane"></i>',
      confirmButtonColor: "#059669",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async (texto) => {
        if (!texto) {
          Swal.showValidationMessage("A mensagem não pode estar vazia");
          return false;
        }
        try {
          await api.post(`/api/admin/contatos/${item.id}/responder`, {
            mensagem: texto,
          });
          return true;
        } catch (error) {
          Swal.showValidationMessage(
            `Falha no envio: ${error.response?.data?.message || "Erro de servidor"}`,
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (textoResposta) {
      Swal.fire({
        title: "Enviado!",
        text: "O email de resposta foi enviado com sucesso.",
        icon: "success",
      });
    }
  }

  const getItemTitle = (item) => {
    if (
      activeSection === "gerenciamentoProjetos" ||
      activeSection === "solicitacaoProjetos"
    )
      return item.nome;
    if (activeSection === "solicitacaoSuporte") return item.nome || "Anônimo";
    return item.nome || "Utilizador sem nome";
  };

  const getItemSubtitle = (item) => {
    if (
      activeSection === "gerenciamentoProjetos" ||
      activeSection === "solicitacaoProjetos"
    )
      return `Área: ${item.area || "Geral"}`;

    if (activeSection === "solicitacaoSuporte") {
      const data = item.dataEnvio
        ? new Date(item.dataEnvio).toLocaleDateString()
        : "";
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
      OUTRO: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${cores[tipo] || cores.OUTRO}`}
      >
        {tipo}
      </span>
    );
  };

  const renderExtraInfo = (item) => {
    if (
      activeSection === "gerenciamentoProjetos" ||
      activeSection === "solicitacaoProjetos"
    ) {
      const nomesCoords =
        item.coordenadores?.map((c) => c.nome).join(", ") || "Sem coordenador";
      return (
        <div className="hidden mr-4 text-right md:block">
          <span className="block text-xs font-semibold text-gray-400 uppercase">
            Responsáveis
          </span>
          <span
            className="text-sm text-slate-700 truncate max-w-[200px] block"
            title={nomesCoords}
          >
            {nomesCoords}
          </span>
        </div>
      );
    } else if (activeSection !== "solicitacaoSuporte") {
      return (
        <div className="hidden mr-4 text-right md:block">
          <span className="block text-xs font-semibold text-gray-400 uppercase">
            CPF
          </span>
          <span className="font-mono text-sm text-slate-700">
            {item.cpf || "—"}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="min-h-screen px-4 pb-12 md:px-8 pt-28 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-emerald-900">
          Painel Administrativo
        </h1>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* MENU LATERAL */}
          <div className="w-full space-y-6 md:w-64 shrink-0">
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Solicitações
                </h2>
              </div>
              <div className="p-2">
                {solicitacoes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <s.icon size={18} /> {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Gerenciamento
                </h2>
              </div>
              <div className="p-2">
                {gerenciamento.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <s.icon size={18} /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CONTEÚDO */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
              <h3 className="font-semibold text-gray-800">
                {solicitacoes.find((s) => s.id === activeSection)?.label ||
                  gerenciamento.find((s) => s.id === activeSection)?.label}
              </h3>
              <span className="px-2 py-1 text-xs text-gray-500 bg-white border rounded">
                {listaDados.length} registros
              </span>
            </div>

            <div className="p-6">
              {loading && (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-emerald-600"></div>
                </div>
              )}

              {erro && (
                <div className="p-4 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50">
                  {erro}
                </div>
              )}

              {!loading && !erro && listaDados.length === 0 && (
                <div className="py-12 text-center text-gray-400">
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
                    <div
                      key={itemId}
                      className={`border rounded-lg transition-all ${isExpanded ? "border-emerald-200 bg-emerald-50/30 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}
                    >
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() =>
                          setExpandedItem(isExpanded ? null : itemId)
                        }
                      >
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {getItemTitle(item)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getItemSubtitle(item)}
                          </p>
                        </div>

                        {renderExtraInfo(item)}
                        {activeSection === "solicitacaoSuporte" &&
                          renderContatoBadge(item.tipoContato)}

                        {/* Status Badges para Contas */}
                        {activeSection === "solicitacaoCadastros" && (
                          <span className="px-2 py-1 text-xs font-bold rounded text-amber-600 bg-amber-100">
                            PENDENTE
                          </span>
                        )}
                        {activeSection === "gerenciamentoContas" &&
                          item.conta?.ativo && (
                            <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">
                              ATIVO
                            </span>
                          )}
                        {activeSection === "gerenciamentoContas" &&
                          !item.conta?.ativo && (
                            <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                              INATIVO
                            </span>
                          )}
                      </div>

                      {isExpanded && (
                        <div className="px-4 pt-0 pb-4 pl-12">
                          {/* SEÇÃO DE SUPORTE */}
                          {activeSection === "solicitacaoSuporte" ? (
                            <div className="p-4 mt-2 bg-white border border-gray-200 rounded">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                "{item.mensagem}"
                              </p>
                              <div className="flex gap-2 mt-4">
                                <a
                                  href={`mailto:${item.email}`}
                                  className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                                >
                                  <Mail size={16} /> Responder por Email
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* Visualizar Documento (Modal) */}
                              {(item.documentoUrl || item.documentoPath) && (
                                <div className="mb-4">
                                  <button
                                    onClick={() =>
                                      setDocumentoVisivel(
                                        item.documentoUrl || item.documentoPath,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded cursor-pointer border-0"
                                  >
                                    <FileText size={14} />
                                    {item.documentoPath
                                      ? "Visualizar Documento do Projeto"
                                      : "Visualizar Comprovante"}
                                  </button>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                                {/* PROJETOS */}
                                {activeSection === "gerenciamentoProjetos" && (
                                  <>
                                    <Link
                                      to={`/detalhes-projeto/${item.id}`}
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                                    >
                                      <Eye size={16} /> Ver Projeto
                                    </Link>
                                    <button
                                      onClick={() =>
                                        handleExcluirProjeto(item.id)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 ml-auto text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      <Trash2 size={16} /> Excluir Projeto
                                    </button>
                                  </>
                                )}

                                {/* CADASTROS PENDENTES */}
                                {activeSection === "solicitacaoCadastros" && (
                                  <>
                                    <button
                                      onClick={() => handleAprovar(accountId)}
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                      <Check size={16} /> Aprovar
                                    </button>
                                    <button
                                      onClick={() => handleExcluir(accountId)}
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50"
                                    >
                                      <X size={16} /> Rejeitar
                                    </button>
                                  </>
                                )}

                                {/* PROJETOS PENDENTES*/}
                                {activeSection === "solicitacaoProjetos" && (
                                  <>
                                    <Link
                                      to={`/detalhes-projeto/${item.id}`}
                                      target="_blank"
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                                    >
                                      <Eye size={16} /> Ver Detalhes
                                    </Link>
                                    <button
                                      onClick={() =>
                                        handleAprovarProjeto(item.id)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded bg-emerald-600 hover:bg-emerald-700"
                                    >
                                      <Check size={16} /> Aprovar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejeitarProjeto(item.id)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                                    >
                                      <X size={16} /> Rejeitar
                                    </button>
                                  </>
                                )}

                                {activeSection === "solicitacaoSuporte" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleResponderContato(item)
                                      }
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                                    >
                                      <Mail size={16} /> Responder por Email
                                    </button>

                                    <button
                                      onClick={() => {
                                        /* Lógica de excluir */
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                                    >
                                      <Trash2 size={16} /> Arquivar
                                    </button>
                                  </>
                                )}

                                {/* GERENCIAMENTO CONTAS */}
                                {activeSection === "gerenciamentoContas" && (
                                  <>
                                    {item.conta?.ativo ? (
                                      <button
                                        onClick={() =>
                                          handleBloquear(accountId)
                                        }
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200"
                                      >
                                        <Ban size={16} /> Bloquear
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleAprovar(accountId)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                                      >
                                        <Check size={16} /> Reativar
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleExcluir(accountId)}
                                      className="flex items-center gap-2 px-4 py-2 ml-auto text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-red-600"
                                    >
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

      {/* --- MODAL DE VISUALIZAÇÃO DE DOCUMENTO --- */}
      {documentoVisivel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="flex items-center gap-2 font-bold text-gray-700">
                <FileText size={20} /> Visualização do Documento
              </h3>
              <button
                onClick={() => setDocumentoVisivel(null)}
                className="p-1 text-gray-500 transition-colors rounded-full hover:bg-gray-200"
                title="Fechar"
              >
                <X size={24} />
              </button>
            </div>

            {/* Corpo do Modal (Iframe) */}
            <div className="relative flex-1 bg-gray-100">
              <iframe
                src={documentoVisivel}
                className="w-full h-full border-none"
                title="Documento"
              />
            </div>

            {/* Rodapé Opcional */}
            <div className="p-3 text-right bg-white border-t border-gray-200">
              <a
                href={documentoVisivel}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Não carregou? Clique aqui para abrir em nova guia.
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
