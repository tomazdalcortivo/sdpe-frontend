# SDPE - Frontend

*[🇧🇷 Leia a versão em Português abaixo](#-sdpe---frontend-português)*

This is the web client for the **Academic Extension Projects Disclosure System (SDPE)**. The interface was developed focusing on usability, accessibility, and responsive design to facilitate student access and management by coordinators.

---

## 🚀 Technologies

The frontend was developed as a modern SPA (Single Page Application) using:

* **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Flowbite React](https://flowbite-react.com/)
* **Routing:** React Router DOM v7
* **API Consumption:** Axios
* **Charts:** Chart.js and React-Chartjs-2
* **Alerts and Feedback:** SweetAlert2
* **Icons:** Lucide React and React Icons
* **Security:** Altcha (Anti-spam widget)

---

## 🖥️ Interface Features

The system is divided into public and private areas:

* **Public Area:**
    * **Home/Project List:** Showcase of extension projects with search functionality.
    * **Project Details:** Comprehensive information about each project.
    * **Authentication:** Login, Registration, and Password Recovery pages.
    * **Accessibility:** Integrated VLibras component for sign language support.

* **Participant Area:**
    * **Profile:** Management of registration data.
    * **My Enrollments:** Tracking participation in academic projects.

* **Administrative/Coordination Area:**
    * **Dashboard (Statistics):** Graphical visualization of system data.
    * **Project Management:** Creation and editing of projects.
    * **Administrative Panel:** User control and approvals.

---

## 📋 Prerequisites

* **Node.js** (Version 18 or higher recommended).
* **NPM** (Node Package Manager).

---

## 📦 Installation & Execution

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/tomazdalcortivo/sdpe-frontend.git](https://github.com/tomazdalcortivo/sdpe-frontend.git)
    cd sdpe-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Verify if the backend API URL is configured correctly (usually in `src/services/api.js` or via `.env` variables if applicable).

4.  **Run in development mode:**
    ```bash
    npm run dev
    ```
    The server will start (usually at `http://localhost:5173`).

5.  **Build for Production:**
    To generate optimized static files:
    ```bash
    npm run build
    ```

---

## 📂 Important Folder Structure

* `/src/pages`: Contains main views (Login, Home, Dashboard, etc).
* `/src/components`: Reusable components (Navbar, Footer, Alerts).
* `/src/services`: Axios configuration and API calls.
* `/src/assets`: Images and static resources.

---
*Interface developed with React and Tailwind for IFPR.*

---

# 🇧🇷 SDPE - Frontend (Português)

*[🇺🇸 Read the English version above](#sdpe---frontend)*

Este é o cliente web do **Sistema de Divulgação de Projetos de Extensão (SDPE)**. A interface foi desenvolvida focando em usabilidade, acessibilidade e design responsivo para facilitar o acesso de alunos e a gestão por parte dos coordenadores.

---

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

---

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

---

## 📋 Pré-requisitos

* **Node.js** (Versão 18 ou superior recomendada).
* **NPM** (Gerenciador de pacotes).

---

## 📦 Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/tomazdalcortivo/sdpe-frontend.git](https://github.com/tomazdalcortivo/sdpe-frontend.git)
    cd sdpe-frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
