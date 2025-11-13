import axios from 'axios';

const API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-vqa-capfilt-large';
const HF_TOKEN = process.env.HF_TOKEN; // Обратите внимание: переменная без REACT_APP_ для серверless функций

export default async function handler(req, res) {
    // Разрешить только POST-запросы (для безопасности)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, question } = req.body;

    if (!image || !question) {
        return res.status(400).json({ error: 'Missing image or question' });
    }

    try {
        // Преобразуем base64 обратно в файл (или передаём как есть, если API поддерживает)
        const formData = new FormData();
        formData.append('inputs', image); // Ожидаем бинарные данные или base64
        formData.append('parameters', JSON.stringify({ question }));

        const response = await axios.post(API_URL, formData, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
            },
        });

        res.status(200).json({ answer: response.data[0]?.answer || 'Не распознано' });
    } catch (error) {
        console.error('Hugging Face API Error:', error);
        res.status(500).json({ error: 'Failed to query model' });
    }
}
