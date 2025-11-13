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

    const handleUpload = async (file) => {
        setImage(URL.createObjectURL(file));
        setLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Image = reader.result;

                const dishNameResponse = await axios.post('/api/vqa', {
                    image: base64Image,
                    question: 'What is the name of this dish?',
                });
                const dishName = dishNameResponse.data.answer?.toLowerCase().trim() || 'Не распознано';

                const caloriesResponse = await axios.post('/api/vqa', {
                    image: base64Image,
                    question: 'What is the approximate calorie content per 100g of this dish in kcal?',
                });
                const caloriesRaw = caloriesResponse.data.answer || 'Не удалось оценить';
                const caloriesMatch = caloriesRaw.match(/\d+/);
                const calories = caloriesMatch ? `${caloriesMatch[0]} ккал/100г` : 'Не удалось оценить';  // Исправила опечатку здесь

                setResult({ name: dishName, calories });
            };
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
