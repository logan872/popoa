import React, { useState, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const fileInputRef = useRef(null);

    const handleUpload = async (file) => {
        // Сброс состояния
        setError(null);
        setImage(URL.createObjectURL(file));
        setLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onloadend = async () => {
                const base64Image = reader.result;

                // Параллельные запросы для ускорения
                const [dishNameResponse, caloriesResponse] = await Promise.all([
                    axios.post('/api/vqa', {
                        image: base64Image,
                        question: 'What is the name of this dish? Describe it briefly.',
                    }),
                    axios.post('/api/vqa', {
                        image: base64Image,
                        question: 'What is the approximate calorie content per 100g of this dish in kcal? Give only number.',
                    })
                ]);

                const dishName = dishNameResponse.data.answer?.toLowerCase().trim() || 'Не распознано';
                const caloriesRaw = caloriesResponse.data.answer || '';
                const caloriesMatch = caloriesRaw.match(/\d+/);
                const calories = caloriesMatch ? `${caloriesMatch[0]} ккал/100г` : 'Не удалось оценить';

                const newResult = {
                    name: dishName,
                    calories,
                    timestamp: new Date().toLocaleString(),
                    image: URL.createObjectURL(file)
                };

                setResult(newResult);

                // Добавляем в историю
                setHistory(prev => [newResult, ...prev.slice(0, 4)]); // Храним последние 5 результатов
            };
        } catch (error) {
            console.error('Ошибка API:', error);
            setError('Произошла ошибка при анализе изображения. Попробуйте еще раз.');
            setResult({
                name: 'Ошибка распознавания',
                calories: '',
                timestamp: new Date().toLocaleString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleClear = () => {
        setImage(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const loadFromHistory = (historyItem) => {
        setImage(historyItem.image);
        setResult(historyItem);
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8">
                    <h1 className="mb-4">🍽️ Распознаватель блюд</h1>
                    <p className="text-muted mb-4">
                        Загрузите изображение блюда для определения его названия и примерной калорийности
                    </p>

                    <ImageUploader
                        onUpload={handleUpload}
                        onClear={handleClear}
                        ref={fileInputRef}
                    />

                    {error && (
                        <div className="alert alert-danger mt-3 d-flex justify-content-between align-items-center">
                            <span>{error}</span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleRetry}>
                                Попробовать снова
                            </button>
                        </div>
                    )}

                    {image && (
                        <div className="mt-4">
                            <h5>Загруженное изображение:</h5>
                            <div className="position-relative" style={{ maxWidth: '500px' }}>
                                <img
                                    src={image}
                                    alt="Загруженное блюдо"
                                    className="img-fluid rounded shadow-sm"
                                />
                                {loading && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Загрузка...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="mt-3">
                            <div className="progress mb-2">
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                    style={{ width: '100%' }}
                                ></div>
                            </div>
                            <p className="text-center text-muted">
                                Анализируем изображение с помощью VQA модели...
                            </p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="mt-4">
                            <ResultDisplay result={result} />
                            <div className="mt-3">
                                <button
                                    className="btn btn-outline-secondary me-2"
                                    onClick={handleClear}
                                >
                                    Анализировать другое изображение
                                </button>
                                <button
                                    className="btn btn-outline-info"
                                    onClick={handleRetry}
                                >
                                    Попробовать снова
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Боковая панель с историей */}
                {history.length > 0 && (
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">📊 История анализов</h6>
                            </div>
                            <div className="card-body">
                                {history.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border-bottom pb-2 mb-2 cursor-pointer ${result?.timestamp === item.timestamp ? 'bg-light rounded p-2' : ''}`}
                                        onClick={() => loadFromHistory(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="rounded me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <strong className="d-block text-truncate" style={{ maxWidth: '150px' }}>
                                                    {item.name}
                                                </strong>
                                                <small className="text-muted">{item.calories}</small>
                                            </div>
                                        </div>
                                        <small className="text-muted">{item.timestamp}</small>
                                    </div>
                                ))}
                                <button
                                    className="btn btn-sm btn-outline-secondary w-100 mt-2"
                                    onClick={() => setHistory([])}
                                >
                                    Очистить историю
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Футер с информацией */}
            <div className="mt-5 pt-4 border-top">
                <div className="row">
                    <div className="col-md-6">
                        <h6>ℹ️ Как это работает?</h6>
                        <p className="text-muted small">
                            Система использует VQA (Visual Question Answering) модель для анализа изображений.
                            Результаты по калорийности являются приблизительными.
                        </p>
                    </div>
                    <div className="col-md-6">
                        <h6>💡 Советы для лучших результатов:</h6>
                        <ul className="text-muted small">
                            <li>Используйте четкие, хорошо освещенные фотографии</li>
                            <li>Снимайте блюдо сверху или под прямым углом</li>
                            <li>Избегайте размытых или темных изображений</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;