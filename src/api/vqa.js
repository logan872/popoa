import axios from 'axios';

const API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-vqa-capfilt-large';
const HF_TOKEN = process.env.HUGGINGFACE_HUB_TOKEN; // Правильное имя переменной в Vercel

export default async function handler(req, res) {
    // Настройка CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Разрешить только POST-запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, question } = req.body;

    if (!image || !question) {
        return res.status(400).json({ error: 'Missing image or question' });
    }

    try {
        // Удаляем префикс data:image если есть
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        const response = await axios.post(
            API_URL,
            {
                inputs: {
                    image: base64Data,
                    question: question
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000 // 30 секунд таймаут
            }
        );

        console.log('HF Response:', response.data);
        res.status(200).json({ answer: response.data[0]?.answer || 'Не распознано' });
    } catch (error) {
        console.error('Hugging Face API Error:', error.response?.data || error.message);

        if (error.response?.status === 503) {
            // Модель загружается
            return res.status(503).json({
                error: 'Model is loading, please try again in a few seconds'
            });
        }

        res.status(500).json({
            error: 'Failed to query model',
            details: error.response?.data || error.message
        });
    }
}