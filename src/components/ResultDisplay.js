import React from 'react';

function ResultDisplay({ result }) {
    return (
        <div className="mt-3">
            <h3>Результат:</h3>
            <p><strong>Блюдо:</strong> {result.name}</p>
            <p><strong>Калорийность:</strong> {result.calories}</p>
        </div>
    );
}

export default ResultDisplay;
