import React from 'react';

const ImageUploader = React.forwardRef(({ onUpload, onClear }, ref) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения');
                return;
            }

            // Проверка размера файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Размер файла не должен превышать 5MB');
                return;
            }

            onUpload(file);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Загрузите изображение блюда</h5>
                <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                />
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary"
                        onClick={() => ref.current?.click()}
                    >
                        📁 Выбрать файл
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={onClear}
                    >
                        🗑️ Очистить
                    </button>
                </div>
                <p className="text-muted mt-2 small">
                    Поддерживаемые форматы: JPG, PNG, WebP. Макс. размер: 5MB
                </p>
            </div>
        </div>
    );
});

export default ImageUploader;