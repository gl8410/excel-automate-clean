# 📊 Excel 智能汇总应用 (Excel Automate Gathering)

[English](README.md) | 中文版

**Excel 智能汇总应用** 是一个强大的、基于 Web 开发的 Excel 文件处理工具。该工具旨在解决日常工作中汇总多个“结构相似但列名不同”的数据表格的问题。通过结合大语言模型 (LLM) 的语义分析能力和直观的用户界面，它能自动识别不同文件中的列对应关系，大幅减少手动复制粘贴的工作量。

---

## 🚀 核心特性

- **🧠 AI 驱动的语义匹配**: 核心引擎利用大语言模型 (LLM) 理解列名的自然语言含义与同义词，从而实现跨文件、跨表头的智能映射。
- **📋 模板深度解析**: 自动分析上传的“目标模板”，利用 AI 为每一列生成含义描述及同义词，且支持用户审核和手动修改。
- **📁 碎片文件批量处理**: 无缝上传多个待汇总的数据源文件（碎片文件），系统自动读取并执行映射匹配，支持非首行表头的自动识别。
- **🎯 灵活的手动校验机制**: 提供清晰的匹配状态视图，对于 AI 未精准匹配的列，用户可以通过简单的下拉列表轻松完成手动纠正。
- **📈 一键合并与导出**: 确认匹配关系后，一键将所有离散数据映射重组为目标模板的统一结构，并自动触发合并后 Excel 的下载。
- **🐳 现代化 Docker 部署**: 采用前后端分离架构的容器化设计，通过 Docker 和 Docker Compose 进行快速部署，简化运维流程。

---

## 📸 运行截图
![模板语义识别](https://media.guil.top/api/public/dl/35c89jL4?inline=true)
![子表头语义修改](https://media.guil.top/api/public/dl/PfSINqi7?inline=true)
![子表语义匹配-中文](https://media.guil.top/api/public/dl/vP-VLKe4?inline=true)
![子表语义匹配-英文](https://media.guil.top/api/public/dl/nZWVIRhP?inline=true)
![数据合并](https://media.guil.top/api/public/dl/jhiYwMO8?inline=true)

---

## 🛠️ 技术栈

### 🎨 前端
- **框架**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 组件库**: Lucide React

### ⚙️ 后端
- **框架**: 采用 Python 后端代理模式以保障 API 安全 (通过 `/api` 路由通讯)
- **AI 集成**: [Google GenAI](https://ai.google.dev/)
- **数据库与认证**: [Supabase](https://supabase.com/)

---

## 🔧 快速入门

### 前提条件
- Node.js (v18+)
- Python (如果需要本地启动代理服务)
- Docker 和 Docker Compose (强烈建议用于服务端部署)
- 正确配置的 `.env` 文件

### 1. 克隆仓库
```bash
git clone https://github.com/your-username/excels-automate-gathering.git
cd excels-automate-gathering
```

### 2. 本地开发设置
```bash
# 安装项目依赖
npm install

# 配置 .env 文件 (确保已包含正确的 Supabase 凭据及 Google GenAI 密钥)

# 启动本地开发服务器
npm run dev
```

### 3. Docker 部署
我们推荐使用 Docker Compose 方式进行生产环境部署。
```bash
# 一键启动服务
docker compose up -d
```
*(注意：请使用 `docker compose` 而非已被弃用的 `docker-compose`。若遇端口冲突，可使用 `lsof -i:<port>` 及 `kill` 指令处理。)*

---

## 📂 项目结构

```text
├── .agents/            # Agent 技能库与工作流
├── app/                # 应用核心配置
├── backend/            # 后端代理服务端 (主要处理大模型 API 安全交互)
├── components/         # React UI 组件库
├── lib/                # 公共工具和共用方法
├── services/           # 外部服务及 AI 接口集成层
└── docker-compose.yml  # Docker Compose 编排文件
```

---

## 🛡️ 安全与网络说明
本项目在安全和网络设计上进行了特别优化。为了防止安全风险，大模型 API 的调用通过后端代理执行，绝不暴露密钥于前端代码中。利用 Nginx 处理反向代理解决跨站与单入口网关 `/api` 代理问题。所有配置均提取至系统环境变量。

---

## 🤝 贡献

欢迎贡献！请随意提交 Pull Request。

## 📄 许可证

本项目在 MIT 许可证下获得许可 - 详见 [LICENSE](LICENSE) 文件。
