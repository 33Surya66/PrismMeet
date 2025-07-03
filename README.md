# PrismMeet

**PrismMeet** is a next-generation, AI-powered collaborative meeting platform. It combines seamless video meetings, real-time chat, collaborative ideation, and advanced GenAI features to help teams run smarter, more productive meetings.

---

## 🚀 Features

- **Modern Video Meeting Experience**
  - Start, join, and schedule meetings with ease
  - Video, audio, and screen sharing
  - Responsive, beautiful UI

- **Real-Time Chat**
  - Instant messaging during meetings
  - Persistent chat history

- **Collaborative Ideation**
  - Post ideas during meetings
  - All ideas are collected and displayed as sticky notes
  - Ideas are attributed to each participant

- **AI-Powered Document Structuring**
  - Switch to "Ideas Mode" to let GenAI (Google Gemini) structure and summarize all meeting ideas
  - Get actionable insights and optimal approaches for your team

- **Automated Minutes of Meeting (MoM)**
  - Generate and view MoM with a single click
  - All meeting documents are stored for future reference

- **AI Note Taker**
  - Speech-to-text note-taking during meetings
  - Notes are saved and can be summarized

- **Secure & Scalable**
  - JWT-based authentication
  - SQLite backend (easy to migrate to other DBs)
  - Built with Express, React, Vite, and Socket.io

---

## 🏗️ Project Structure

```
PrismMeet/
  backend/      # Node.js/Express API, SQLite DB, Socket.io server
  frontend/     # React + Vite + Tailwind UI
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/PrismMeet.git
cd PrismMeet
```

### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Start the backend

```bash
cd ../backend
node index.js
# or use nodemon for auto-reload
```

### 4. Start the frontend

```bash
cd ../frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4000](http://localhost:4000)

---

## ⚡ Usage

- Register or log in.
- Create or join a meeting.
- Use the chat and video features.
- Post ideas in the Ideas & Features pane.
- Click "View Document" to see all ideas as sticky notes.
- Switch to "Ideas Mode" for GenAI-powered structuring (Gemini integration ready).
- View or generate Minutes of Meeting.

---

## 🤖 GenAI Integration

- The backend is ready for Google Gemini (or OpenAI) integration for document structuring and summarization.
- Plug in your API key and implement the `/api/docs/:meetingId/structure` endpoint to enable full GenAI features.

---

## 🧩 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, SQLite, JWT, Google APIs
- **AI:** Google Gemini (integration-ready), OpenAI (optional)

---

## 📦 Scripts

### Frontend

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

### Backend

- `node index.js` — Start backend server

---

## 📝 License

MIT License

---

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/)
- [Socket.io](https://socket.io/)
- [Google Gemini](https://ai.google.dev/gemini-api/docs)
- [OpenAI](https://openai.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**PrismMeet — Where meetings become meaningful.**