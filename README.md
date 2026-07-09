# InterviewAce

InterviewAce is an AI-powered platform designed to help candidates prepare for interviews by providing AI-generated questions, feedback, and performance tracking.

## 🚀 Features

- **AI-Powered Interviews:** Generates interview questions using Google's Gemini AI (`@google/genai`).
- **Resume Parsing:** Upload and parse resumes (PDF) to tailor questions based on the candidate's experience.
- **Secure Authentication:** Integrated with Clerk for robust and secure user authentication.
- **Performance Analytics:** Visualizes your performance metrics using Recharts.
- **Modern UI:** Built with React 19, Vite, and styled with Tailwind CSS v4 for a fast and beautiful interface.
- **Robust Backend:** Express.js and MongoDB (Mongoose) architecture to handle data efficiently.

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Routing:** React Router v7
- **State/Data Fetching:** React Query, Axios
- **Authentication:** Clerk React
- **UI Components:** Recharts, React Dropzone, React Markdown, React Icons

### Server (Backend)
- **Environment:** Node.js, Express 5
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Google GenAI
- **Authentication:** Clerk Express
- **File Handling:** Multer, PDF-Parse
- **Security & Utilities:** Helmet, CORS, Express Rate Limit, Morgan, dotenv

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Database
- Clerk Account (for authentication)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd InterviewAce
   ```

2. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

### Environment Variables

You'll need to set up environment variables for both the client and server.

**Client (`client/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

**Server (`server/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```

The client will typically run on `http://localhost:5173/` and the server on `http://localhost:5000/`.

## License

This project is licensed under the ISC License.
