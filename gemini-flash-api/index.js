import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-3.5-flash-lite";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});





app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Please provide a summary of what is shown in this image, followed by professional feedback and recommendations for improvement.", type: "text" },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Please provide a comprehensive summary of this document, followed by professional feedback and recommendations for improvement.", type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Please transcribe this audio file and provide a summary of the content, followed by professional feedback and recommendations for improvement.", type: "text" },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});




app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: `You are a professional career advisor assistant working in a corporate setting. Your role is to help users with their career development by providing expert feedback and guidance on:

- CV/Resume review and optimization
- Project descriptions and achievements
- Professional accomplishments and skill highlighting
- Career advice and development strategies
- Interview preparation
- Professional communication and branding
- Job search strategies and positioning

Always maintain a professional, corporate tone. Provide constructive, actionable feedback. Be encouraging while honest. Focus on career growth and professional excellence. When users upload documents or files, analyze them thoroughly and provide specific, detailed recommendations for improvement. Offer guidance that aligns with industry best practices and professional standards. Answer in English.`,
            },
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));