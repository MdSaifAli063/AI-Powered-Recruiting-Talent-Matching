# 🧠 HireMind — AI-Powered Recruiting & Talent Matching

HireMind is a premium, full-stack AI talent matching platform designed to transform the recruitment process. It leverages advanced Large Language Models and semantic embeddings to match candidates with jobs based on deep context rather than just keywords.

![Hero Image Mockup](https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

### 🔍 Intelligence & Matching
- **🎯 Semantic Job Matching**: Uses vector embeddings to find the perfect fit based on skills, experience depth, and cultural nuances.
- **📄 AI Resume Analyzer**: Instantly extracts key skills and provides actionable feedback on resume quality.
- **📈 Skill Gap Analysis**: Maps candidate profiles against job requirements and generates personalized learning paths.

### 💼 Recruiter Tools
- **📊 Talent Pipeline**: A beautiful, interactive Kanban board to manage candidates across hiring stages.
- **🛡️ JD Bias Detector**: Automatically scans job descriptions for exclusionary language to ensure inclusive hiring.
- **✉️ AI Outreach Generator**: Drafts personalized, context-aware messages for candidates in seconds.

### 🎙️ Candidate Experience
- **🤖 AI Interviewer**: Adaptive, conversational interview sessions with real-time feedback and score reports.
- **⚡ Profile Health Score**: Gamified profile building to help candidates stand out.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT |
| **AI Engine** | OpenAI (GPT-4o-mini), Semantic Embeddings (text-embedding-3-small) |
| **Architecture** | REST API, Concurrent Server Orchestration |

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key

### 2️⃣ Installation
```bash
# Install root dependencies
npm install

# Install all sub-project dependencies
npm run install:all
```

### 3️⃣ Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

### 4️⃣ Run the Platform
Start both the frontend and backend with a single command from the root:
```bash
npm run dev
```

## 🎨 Design System
The platform features an ultra-premium **Glassmorphism** aesthetic with:
- 🌌 Deep Navy & Cyan color palette.
- ⚡ Fluid Framer Motion animations.
- 📐 Geometric abstract UI elements.
- 🖋️ Professional Outfit & Inter typography.

---

Built with ❤️ for the future of hiring.
