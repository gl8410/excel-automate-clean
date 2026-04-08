# 📊 Excel Automate Gathering

English | [中文版](README_CN.md)

**Excel Automate Gathering** (Excel Intelligent Summarization Application) is a powerful, AI-driven web tool designed to automatically merge multiple Excel files with similar structures but varying column names into a unified, standardized template. By leveraging advanced LLM semantic analysis and providing an intuitive UI, it drastically reduces the manual effort of matching and copy-pasting data.

---

## 🚀 Key Features

- **🧠 AI-Powered Semantic Matching**: Core engine utilizes LLMs to understand natural language semantics and synonyms of column headers, enabling intelligent cross-file mapping.
- **📋 Template Definition Engine**: Analyze uploaded "target templates" automatically. AI generates robust descriptions for each column, which can be reviewed and manually calibrated.
- **📁 Fragment File Processing**: Seamlessly upload multiple source data files (Fragment Files). The system parses and maps them rapidly.
- **🎯 Manual Calibration & Override**: Provides a clear visualization of AI matching status. Users retain full control to manually correct any misaligned columns via simple dropdowns.
- **📈 One-Click Summarization & Export**: Instantly extract, align, and consolidate all mapped data into the standard template format, generating a unified Excel file for download.
- **🐳 Modern Docker Deployment**: Containerized with Docker and Docker Compose for streamlined setup and isolated environments.

---

## 📸 Screenshots
*(Visuals and screenshots showcasing template definition, smart matching, and summarization flow should be placed here)*

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & UI**: Lucide React

### ⚙️ Backend
- **Framework**: Python Backend proxying LLM API calls securely (via `/api`)
- **AI Integrations**: [Google GenAI](https://ai.google.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (if running proxy locally without Docker)
- Docker and Docker Compose (highly recommended for production deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/excels-automate-gathering.git
cd excels-automate-gathering
```

### 2. Local Setup
```bash
# Install dependencies
npm install

# Set up your .env file
# Ensure necessary keys like Supabase credentials and Google GenAI keys are provided

# Start the Vite development server
npm run dev
```

### 3. Docker Deployment
We provide a streamlined `docker-compose` setup for staging and production.
```bash
# Start services in detached mode
docker compose up -d
```
*(Note: Please ensure you use `docker compose` instead of the older `docker-compose` command to avoid compatibility issues. Port conflicts can be managed using `lsof -i:<port>` and `kill`)*

---

## 📂 Project Structure

```text
├── .agents/            # Agent skills and workflows
├── app/                # Application core configurations
├── backend/            # Proxy backend for secure API handling
├── components/         # Reusable React UI Components
├── lib/                # Shared utilities and helpers
├── services/           # External API & AI integration services
└── docker-compose.yml  # Infrastructure as Code for simplified deployment
```

---

## 🛡️ Security Best Practices
As outlined in our operational reviews, this project implements a backend proxy pattern. AI API keys are handled securely by backend services rather than being exposed in the frontend. Ensure `.env` is properly injected during the Docker build or mapped during container runtime.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
