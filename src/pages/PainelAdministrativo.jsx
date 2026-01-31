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
import Swal from "sweetalert2";
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
    const result = await Swal.fire({
      title: "Tem a certeza?",
      text: "Isso excluirá o projeto, arquivos, visualizações e contatos vinculados. Não pode ser desfeito.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/admin/projetos/${idProjeto}`);
      Swal.fire("Excluído!", "O projeto foi excluído com sucesso.", "success");
      buscarDados();
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Erro ao excluir projeto.", "error");
    }
  }

  async function handleAprovarProjeto(idProjeto) {
    try {
      await api.patch(`/api/admin/projetos/${idProjeto}/status`, null, {
        params: { ativo: true },
      });
      Swal.fire({
        title: "Aprovado!",
        text: "Projeto aprovado com sucesso!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      buscarDados();
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Erro ao aprovar projeto.", "error");
    }
  }

  async function handleRejeitarProjeto(idProjeto) {
    const { value: motivo } = await Swal.fire({
      title: "Rejeitar Projeto",
      input: "textarea",
      inputLabel: "Motivo da rejeição",
      inputPlaceholder: "Explique o motivo para o coordenador...",
      showCancelButton: true,
      confirmButtonText: "Rejeitar",
      confirmButtonColor: "#d33",
      inputValidator: (value) => {
        if (!value) {
          return "Você precisa escrever um motivo!";
        }
      }
    });

    if (motivo) {
      try {
        await api.patch(`/api/admin/projetos/${idProjeto}/rejeitar`, { motivo });
        Swal.fire("Rejeitado", "Projeto rejeitado e notificação enviada.", "success");
        buscarDados();
      } catch (error) {
        Swal.fire("Erro", "Erro ao rejeitar projeto.", "error");
      }
    }
  }

  async function handleAprovar(idConta) {
    try {
      await api.patch(`/api/admin/contas/${idConta}/status`, null, {
        params: { ativo: true },
      });
      const texto = activeSection === "gerenciamentoContas" ? "Conta reativada!" : "Conta aprovada!";
      Swal.fire({
        title: "Sucesso!",
        text: texto,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      buscarDados();
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Erro ao ativar conta.", "error");
    }
  }

  async function handleBloquear(idConta) {
    const result = await Swal.fire({
      title: "Bloquear conta?",
      text: "O usuário perderá acesso ao sistema imediatamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, bloquear"
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`/api/admin/contas/${idConta}/status`, null, {
        params: { ativo: false },
      });
      Swal.fire("Bloqueado!", "A conta foi bloqueada.", "success");
      buscarDados();
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Erro ao bloquear conta.", "error");
    }
  }

  async function handleExcluir(idConta) {
    const result = await Swal.fire({
      title: "Exclusão Permanente",
      text: "Isso excluirá a conta, perfil e TODOS os projetos deste utilizador (se for coordenador).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir tudo!"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/admin/contas/${idConta}`);
      Swal.fire("Excluído!", "Conta e dados excluídos.", "success");
      buscarDados();
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Erro ao excluir conta.", "error");
    }
  }

  async function handleResponderContato(item) {
    const { value: textoResposta } = await Swal.fire({
      title: `Responder a ${item.nome || 'Usuário'}`,
      input: "textarea",
      inputLabel: `Para: ${item.email}`,
      inputPlaceholder: "Escreva a sua resposta aqui...",
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
            `Falha no envio: ${error.response?.data?.message || "Erro de servidor"}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (textoResposta) {
      Swal.fire("Enviado!", "O email de resposta foi enviado com sucesso.", "success");
    }
  }

  async function handleArquivarContato(id) {
    const result = await Swal.fire({
      title: 'Arquivar mensagem?',
      text: "Esta mensagem será removida permanentemente da lista.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, arquivar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/admin/contatos/${id}`);
        Swal.fire('Arquivado!', 'Mensagem removida.', 'success');
        buscarDados();
      } catch (error) {
        Swal.fire('Erro!', 'Erro ao arquivar mensagem.', 'error');
      }
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
                  const accountId = item.conta?.id;

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
                        {activeSection === "gerenciamentoProjetos" &&
                          (item.status ? (
                            <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">
                              ATIVO
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                              INATIVO
                            </span>
                          ))}
                        {activeSection === "solicitacaoProjetos" && (
                          <span className="px-2 py-1 text-xs font-bold rounded text-amber-600 bg-amber-100">
                            PENDENTE
                          </span>
                        )}

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

                          {activeSection === "solicitacaoSuporte" ? (
                            <div className="p-4 mt-2 bg-white border border-gray-200 rounded">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {item.mensagem}
                              </p>
                              <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => handleResponderContato(item)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                                >
                                  <Mail size={16} /> Responder por Email
                                </button>
                                <button
                                  onClick={() => handleArquivarContato(item.id)}
                                  className="flex items-center gap-2 px-4 py-2 ml-auto text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                                >
                                  <Trash2 size={16} /> Deletar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
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

                              {(activeSection === "solicitacaoCadastros" || activeSection === "gerenciamentoContas") && (
                                <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                                  <h4 className="font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-3">
                                    Dados Completos do Participante
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">CPF</span>
                                      <span className="text-slate-700 font-mono">{item.cpf || "—"}</span>
                                    </div>

                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">Data de Nascimento</span>
                                      <span className="text-slate-700">
                                        {item.dataNascimento ? new Date(item.dataNascimento).toLocaleDateString('pt-BR') : "—"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">Telefone</span>
                                      <span className="text-slate-700">{item.telefone || "—"}</span>
                                    </div>

                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">Localidade</span>
                                      <span className="text-slate-700">
                                        {item.cidade ? `${item.cidade} - ${item.estado}` : "—"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">Data de Cadastro</span>
                                      <span className="text-slate-700">
                                        {item.conta?.dataCriacao ? new Date(item.conta.dataCriacao).toLocaleDateString('pt-BR') : "—"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="block text-xs font-bold text-slate-400 uppercase">Vínculo Institucional</span>
                                      <span className={`font-semibold ${item.vinculoInstitucional ? "text-green-600" : "text-gray-500"}`}>
                                        {item.vinculoInstitucional ? "Sim, possui vínculo" : "Não informado"}
                                      </span>
                                    </div>

                                    {(item.cargoInstituicao || item.funcao) && (
                                      <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-200">
                                        <p className="text-xs font-bold text-emerald-600 mb-2 uppercase">Dados Institucionais (Coordenador)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">Cargo</span>
                                            <span className="text-slate-700">{item.cargoInstituicao || "—"}</span>
                                          </div>
                                          <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">Função</span>
                                            <span className="text-slate-700">{item.funcao || "—"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {item.resumo && (
                                    <div className="mt-4 pt-3 border-t border-slate-200">
                                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Resumo / Apresentação</span>
                                      <div className="bg-white p-3 rounded border border-slate-100 text-slate-600 italic">
                                        "{item.resumo}"
                                      </div>
                                    </div>
                                  )}
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
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                                    >
                                      <Trash2 size={16} /> Deletar
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
