import React from 'react';

const ResultDisplay = ({ result }) => {
    const getCalorieColor = (caloriesText) => {
        const match = caloriesText.match(/\d+/);
        if (!match) return 'secondary';

        const calories = parseInt(match[0]);
        if (calories < 100) return 'success';
        if (calories < 300) return 'warning';
        return 'danger';
    };

    return (
        <div className="card">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📋 Результаты анализа</h5>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold">🍽️ Название блюда:</label>
                            <div className="p-2 bg-light rounded">
                                {result.name}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold">🔥 Калорийность:</label>
                            <div className={`p-2 bg-${getCalorieColor(result.calories)} bg-opacity-10 rounded border border-${getCalorieColor(result.calories)}`}>
                                <span className={`text-${getCalorieColor(result.calories)} fw-bold`}>
                                    {result.calories}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {result.timestamp && (
                    <div className="mt-3">
                        <small className="text-muted">
                            Проанализировано: {result.timestamp}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultDisplay;