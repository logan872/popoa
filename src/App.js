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
        setError(null);
        setImage(URL.createObjectURL(file));
        setLoading(true);

        try {
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            // Делаем последовательные запросы вместо параллельных для надежности
            let dishName = 'Не распознано';
            let calories = 'Не удалось оценить';

            try {
                const dishNameResponse = await axios.post('/api/vqa', {
                    image: base64Image,
                    question: 'What food is in this image? Name the dish.',
                }, {
                    timeout: 30000
                });
                dishName = dishNameResponse.data.answer?.toLowerCase().trim() || 'Не распознано';
            } catch (err) {
                console.error('Dish name error:', err);
                dishName = 'Ошибка распознавания названия';
            }

            try {
                const caloriesResponse = await axios.post('/api/vqa', {
                    image: base64Image,
                    question: 'Estimate calories per 100g for this food. Answer with number only.',
                }, {
                    timeout: 30000
                });

                const caloriesRaw = caloriesResponse.data.answer || '';
                const caloriesMatch = caloriesRaw.match(/\d+/);
                calories = caloriesMatch ? `${caloriesMatch[0]} ккал/100г` : 'Не удалось оценить';
            } catch (err) {
                console.error('Calories error:', err);
                // Продолжаем с уже полученным названием блюда
            }

            const newResult = {
                name: dishName,
                calories,
                timestamp: new Date().toLocaleString(),
                image: URL.createObjectURL(file)
            };

            setResult(newResult);
            setHistory(prev => [newResult, ...prev.slice(0, 4)]);

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            let errorMessage = 'Произошла ошибка при анализе изображения';

            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Проблемы с соединением. Проверьте интернет.';
            } else if (error.response?.status === 503) {
                errorMessage = 'Модель загружается, попробуйте через 10-20 секунд';
            } else if (error.response?.status === 405) {
                errorMessage = 'Ошибка сервера: метод не разрешен';
            }

            setError(errorMessage);
            setResult({
                name: 'Ошибка',
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
        setError(null);
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8">
                    <h1 className="mb-4">🍽️ Распознаватель блюд</h1>

                    <ImageUploader
                        onUpload={handleUpload}
                        onClear={handleClear}
                        ref={fileInputRef}
                        disabled={loading}
                    />

                    {error && (
                        <div className="alert alert-warning mt-3 d-flex justify-content-between align-items-center">
                            <span>{error}</span>
                            <button className="btn btn-outline-warning btn-sm" onClick={handleRetry}>
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
                                    style={{ maxHeight: '300px' }}
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
                                Анализируем изображение... Это может занять до 30 секунд
                            </p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="mt-4">
                            <ResultDisplay result={result} />
                            <div className="mt-3">
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={handleClear}
                                >
                                    📸 Анализировать другое изображение
                                </button>
                                {error && (
                                    <button
                                        className="btn btn-outline-warning"
                                        onClick={handleRetry}
                                    >
                                        🔄 Попробовать снова
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {history.length > 0 && (
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">📊 История</h6>
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
        </div>
    );
}

export default App;