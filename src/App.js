import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-vqa-capfilt-large';
const HF_TOKEN = process.env.REACT_APP_HF_TOKEN;

function App() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const queryVQA = async (file, question) => {
        const formData = new FormData();
        formData.append('inputs', file);
        formData.append('parameters', JSON.stringify({ question }));

        const response = await axios.post(API_URL, formData, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
            },
        });
        return response.data[0]?.answer || 'Не распознано';
    };

    const handleUpload = async (file) => {
        setImage(URL.createObjectURL(file));
        setLoading(true);

        try {
            const dishNameRaw = await queryVQA(file, 'What is the name of this dish?');
            const dishName = dishNameRaw.toLowerCase().trim();

            const caloriesRaw = await queryVQA(file, 'What is the approximate calorie content per 100g of this dish in kcal?');
            // Парсим числовое значение (например, "200" из текста)
            const caloriesMatch = caloriesRaw.match(/\d+/);
            const calories = caloriesMatch ? `${caloriesMatch[0]} ккал/100г` : 'Не удалось оценить';

            setResult({ name: dishName, calories });
        } catch (error) {
            console.error('Ошибка API:', error);
            setResult({ name: 'Ошибка распознавания', calories: '' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Распознаватель блюд (VQA)</h1>
            <ImageUploader onUpload={handleUpload} />
            {image && <img src={image} alt="Загруженное" className="img-fluid mt-3" />}
            {loading && <p className="mt-3">Анализируем (VQA может занять время)...</p>}
            {result && <ResultDisplay result={result} />}
        </div>
    );
}

export default App;
