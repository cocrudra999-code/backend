# 🚀 YouTube SEO Generator — Backend

A Node.js & Express REST API powered by Google Gemini to generate high-performing YouTube `#hashtags`, SEO keywords, title suggestions, and SEO scores from YouTube video URLs or video scripts.

---

## ⚡ Features

- **YouTube Video URL SEO Analysis**: Automatically extracts real video metadata (title, creator, description, tags, transcript) and passes context to Gemini for video-accurate hashtags and SEO recommendations.
- **Video Script SEO Generation**: Analyzes raw video scripts, extracts core topics, and generates ranked hashtags and keywords.
- **AI Scoring Engine**: Calculates relevance, search volume, and competition scores for top hashtags.
- **Security & Performance**: Built with Helmet, CORS, and Rate Limiting.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **AI Model**: Google Gemini API (`@google/generative-ai`)
- **Metadata & Transcript**: YouTube oEmbed, HTML scraping & `youtube-transcript`

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 📡 API Endpoints

### 1. Generate SEO from YouTube URL
- **Endpoint**: `POST /api/seo/youtube`
- **Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
  ```

### 2. Generate SEO from Video Script
- **Endpoint**: `POST /api/seo/script`
- **Body**:
  ```json
  {
    "script": "Paste your full video script here..."
  }
  ```

### 3. Health Check
- **Endpoint**: `GET /api/health`
