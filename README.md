---

### 2. Documentação do Frontend (`sdpe-frontend/README.md`)

Esta versão substitui o template padrão do Vite por informações específicas do seu projeto, listando as páginas que identifiquei na estrutura de arquivos e as bibliotecas de UI utilizadas.

```markdown
# SDPE - Frontend

Este é o cliente web do **Sistema de Divulgação de Projetos de Extensão (SDPE)**. A interface foi desenvolvida focando em usabilidade, acessibilidade e design responsivo para facilitar o acesso de alunos e a gestão por parte dos coordenadores.

## 🚀 Tecnologias

O frontend foi desenvolvido como uma SPA (Single Page Application) moderna utilizando:

* **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) + [Flowbite React](https://flowbite-react.com/)
* **Roteamento:** React Router DOM v7
* **Consumo de API:** Axios
* **Gráficos:** Chart.js e React-Chartjs-2
* **Alertas e Feedback:** SweetAlert2
* **Ícones:** Lucide React e React Icons
* **Segurança:** Altcha (Widget anti-spam)

## 🖥️ Funcionalidades da Interface

O sistema é dividido em áreas públicas e privadas:

* **Área Pública:**
    * **Início/Lista de Projetos:** Vitrine de projetos de extensão com busca.
    * **Detalhes do Projeto:** Informações completas sobre cada projeto.
    * **Autenticação:** Páginas de Login, Cadastro e Recuperação de Senha.
    * **Acessibilidade:** Componente VLibras integrado.

* **Área do Participante:**
    * **Perfil:** Gerenciamento de dados cadastrais.
    * **Minhas Inscrições:** Acompanhamento de participação em projetos.

* **Área Administrativa/Coordenação:**
    * **Dashboard (Estatísticas):** Visualização gráfica de dados do sistema.
    * **Gestão de Projetos:** Criação e edição de projetos.
    * **Painel Administrativo:** Controle de usuários e aprovações.

## 📋 Pré-requisitos

* **Node.js** (Versão 18 ou superior recomendada).
* **NPM** (Gerenciador de pacotes).

## 📦 Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/tomazdalcortivo/sdpe-frontend.git](https://github.com/tomazdalcortivo/sdpe-frontend.git)
    cd sdpe-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente:**
    Verifique se a URL da API backend está configurada corretamente (geralmente em `src/services/api.js` ou via variáveis de ambiente `.env` se aplicável).

4.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor iniciará (geralmente em `http://localhost:5173`).

5.  **Build para Produção:**
    Para gerar os arquivos estáticos otimizados:
    ```bash
    npm run build
    ```

## 📂 Estrutura de Pastas Importantes

* `/src/pages`: Contém as views principais (Login, Home, Dashboard, etc).
* `/src/components`: Componentes reutilizáveis (Navbar, Footer, Alerts).
* `/src/services`: Configuração do Axios e chamadas à API.
* `/src/assets`: Imagens e recursos estáticos.

---
*Interface desenvolvida com React e Tailwind para o IFPR.*
