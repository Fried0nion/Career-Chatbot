# Career Chatbot by Gemini AI

> A professional AI-powered career advisor chatbot built with Node.js, Express, and Google Gemini API. Get expert feedback on your CV, projects, and career growth with AI analysis.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Troubleshooting](#troubleshooting)

---

## Overview

Career Chatbot is a modern web application that provides professional career guidance through an interactive chat interface. The application uses Google's Gemini AI to analyze documents, images, and audio files to provide comprehensive feedback and recommendations for career development.

Whether you're looking to improve your CV, get feedback on your portfolio, or receive guidance on career growth, Career Chatbot delivers professional insights in a conversational format.

---

## Features

### 🎯 Core Features
- **Real-time Chat Interface** - Conversational AI advisor with professional tone
- **Document Analysis** - Upload and analyze CVs, resumes, and career documents
- **Image Recognition** - Analyze portfolio screenshots and professional images
- **Audio Transcription** - Transcribe and analyze career-related audio content
- **Professional Feedback** - Get actionable recommendations and improvement suggestions
- **Markdown Support** - Beautifully formatted responses with proper typography

### 💻 User Interface
- **Modern ChatGPT-style Design** - Clean, intuitive, and professional appearance
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile devices
- **Media Preview** - View images in full-screen modal and play audio inline
- **Visual Hierarchy** - Clear typography with headings, lists, and emphasis
- **Real-time Feedback** - Instant visual feedback for user actions

### 🚀 Performance
- **Fast Response Time** - Optimized API communication
- **Client-side Processing** - Efficient file handling and preview generation
- **Smooth Animations** - Polished user experience with fade-in effects
- **Error Handling** - Comprehensive error messages and recovery

---

## Requirements

### System Requirements
- **Node.js** - v16 or higher
- **npm** - v7 or higher
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge (latest versions)

### API Requirements
- **Google Gemini API Key** - Required for AI functionality
  - Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Free tier available with rate limits
  - Paid plans for production use

### Network
- Active internet connection for API calls
- CORS enabled (application handles cross-origin requests)

---

## Installation

### Step 1: Clone or Download the Project

```bash
# Navigate to your desired directory
cd "path/to/Test app"

# Clone the repository (if using Git)
git clone <repository-url>

# Or extract the provided files
```

### Step 2: Navigate to Project Directory

```bash
cd Career-Chatbot
cd gemini-flash-api
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `dotenv` - Environment variable management
- `cors` - Cross-Origin Resource Sharing
- `multer` - File upload handling
- `@google/genai` - Google Gemini API client

---

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the `gemini-flash-api` directory:

```bash
# Windows (Command Prompt)
type nul > .env

# Or create it manually in the folder
```

### Step 2: Add API Key

Open `.env` and add your Google Gemini API key:

```env
GEMINI_API_KEY=your-google-gemini-api-key-here
```

**How to Get Your API Key:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key
4. Paste it into your `.env` file

### Step 3: Verify Configuration

Ensure the following files exist:
- `.env` - Contains your API key
- `package.json` - Project dependencies
- `index.js` - Main server file
- `public/` - Frontend files (HTML, CSS, JS)

---

## Usage

### Starting the Application

```bash
# From the gemini-flash-api directory
node index.js

# Or use npm if configured in package.json
npm start
```

**Expected Output:**
```
Server ready on http://localhost:3000
```

### Accessing the Application

1. Open your browser
2. Navigate to `http://localhost:3000`
3. You should see the Career Chatbot interface

### Using the Chatbot

#### 📝 Text Messages
- Type your career-related questions in the input box
- Click the arrow button or press Enter to send
- Get professional feedback and guidance

#### 📄 Document Upload
- Click the **File Icon** (📄) to upload documents
- Supported: PDF, DOCX, TXT, XLSX, XLS
- The AI will analyze and provide feedback automatically

#### 🖼️ Image Upload
- Click the **Image Icon** (🖼️) to upload images
- Supported: PNG, JPG, JPEG, GIF, WEBP
- Click on the image in the chat to view full-screen
- Get detailed feedback on portfolio items or screenshots

#### 🎵 Audio Upload
- Click the **Microphone Icon** (🎤) to upload audio
- Preview the audio before sending in the input area
- The AI will transcribe and analyze the content
- Listen to the audio directly in the chat

#### Optional Prompts
- Type a custom prompt along with file uploads (e.g., "Improve the structure of my CV")
- If no prompt is provided, the AI uses default analysis requests:
  - Documents: "Provide a comprehensive summary and professional feedback"
  - Images: "Summarize what's shown and provide professional feedback"
  - Audio: "Transcribe and provide a summary with professional feedback"

---

## Project Structure

```
Career-Chatbot/
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore rules
├── gemini-flash-api/
│   ├── .env                          # Environment variables (NOT in repo)
│   ├── index.js                      # Main server file
│   ├── package.json                  # Project dependencies
│   ├── package-lock.json             # Locked dependency versions
│   ├── node_modules/                 # Installed dependencies
│   └── public/                       # Frontend files
│       ├── index.html               # Main HTML page with chat UI
│       ├── style.css                # Responsive styling and layout
│       └── script.js                # Chat functionality and API communication
└── .git/                             # Git repository (if applicable)
```

---

## API Endpoints

### 1. Chat Endpoint
```
POST /api/chat
Content-Type: application/json

Request Body:
{
  "conversation": [
    { "role": "user", "text": "Your message here" },
    { "role": "model", "text": "AI response" },
    { "role": "user", "text": "Follow-up message" }
  ]
}

Response:
{
  "result": "AI generated response with analysis and feedback"
}
```

### 2. Document Analysis
```
POST /generate-from-document
Content-Type: multipart/form-data

Parameters:
- document: File (PDF, DOCX, TXT, XLSX, XLS)
- prompt: String (optional)

Response:
{
  "result": "Document analysis and feedback"
}
```

### 3. Image Analysis
```
POST /generate-from-image
Content-Type: multipart/form-data

Parameters:
- image: File (PNG, JPG, JPEG, GIF, WEBP)
- prompt: String (optional)

Response:
{
  "result": "Image analysis and feedback"
}
```

### 4. Audio Transcription
```
POST /generate-from-audio
Content-Type: multipart/form-data

Parameters:
- audio: File (MP3, WAV, OGG, M4A, etc.)
- prompt: String (optional)

Response:
{
  "result": "Audio transcription and analysis"
}
```

---

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **Google Gemini API** - AI and language model
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern responsive styling with flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icon library
- **Responsive Design** - Mobile-first approach

### Tools & Services
- **Google Gemini 3.5 Flash Lite** - AI model for analysis
- **Local Storage** - Conversation history (optional)
- **File APIs** - Browser-based file handling

---

## Troubleshooting

### Issue: "Cannot GET /" Error

**Solution:**
1. Ensure `index.js` is serving static files correctly
2. Verify `public/` folder exists with `index.html`
3. Restart the server

```bash
# Stop server (Ctrl + C)
# Restart
node index.js
```

### Issue: API Key Not Working

**Causes & Solutions:**
1. **Invalid Key Format**
   - Verify key is copied correctly from Google AI Studio
   - Check for extra spaces or characters

2. **Rate Limit Exceeded**
   - Free tier: 60 requests per minute
   - Upgrade to paid plan for higher limits

3. **No Internet Connection**
   - Ensure stable internet connection
   - Check firewall settings

### Issue: File Upload Fails

**Solutions:**
1. **File Too Large**
   - Maximum file size: 10MB
   - Compress or split large files

2. **Unsupported Format**
   - Documents: PDF, DOCX, TXT, XLSX, XLS
   - Images: PNG, JPG, JPEG, GIF, WEBP
   - Audio: MP3, WAV, OGG, M4A, FLAC

3. **Upload Timeout**
   - Check internet speed
   - Try with smaller file
   - Increase server timeout if needed

### Issue: Responses Are Slow

**Solutions:**
1. Check internet connection speed
2. Verify API quota not exceeded
3. Try simpler queries first
4. Check server logs for errors

### Issue: Audio Player Not Working

**Solutions:**
1. **Browser Compatibility**
   - Update browser to latest version
   - Try different browser

2. **Audio Format Issue**
   - Convert audio to MP3 or WAV format
   - Use online converter if needed

3. **Clear Browser Cache**
   ```bash
   # Clear cache in browser settings
   # Or reload page: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
   ```

### Issue: CORS or Connection Errors

**Solution:**
1. Ensure server is running on `http://localhost:3000`
2. Check firewall allowing port 3000
3. Verify API key is valid
4. Check browser console for specific errors (F12)

---

## Performance Tips

### For Best Results:
1. **Clear, Specific Prompts** - Better feedback with detailed requests
2. **Good Quality Files** - Clear images and audio produce better analysis
3. **Smaller File Sizes** - Faster upload and processing
4. **Stable Internet** - Reliable connection for API calls
5. **Modern Browser** - Use latest version for optimal experience

### For Production Deployment:
1. Use paid Gemini API tier for higher limits
2. Implement rate limiting on server
3. Add user authentication
4. Use HTTPS for security
5. Deploy on cloud platform (Heroku, Vercel, AWS, etc.)

---

## Support & Contributing

### Getting Help
- Check the [Troubleshooting](#troubleshooting) section
- Review API documentation
- Check browser console (F12) for error messages

### Reporting Issues
- Note the error message
- Include steps to reproduce
- Specify browser and OS
- Check if API key is valid

---

## License

This project uses the Google Gemini API. Please refer to Google's terms of service for usage rights and limitations.

---

## Disclaimer

This chatbot is just for demonstration, although the prompt is designed for career guidance and professional feedbacks, always verify important career decisions with qualified professionals. The chatbot's responses are generated by AI and may not always be 100% accurate. Use judgment when applying recommendations.

---

**Created with ❤️ | Powered by Google Gemini AI**

For the latest updates and information, visit the project repository.
