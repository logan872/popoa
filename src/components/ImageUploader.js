import React from 'react';

function ImageUploader({ onUpload }) {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) onUpload(file);
    };

    return (
        <div className="mb-3">
            <label htmlFor="imageInput" className="form-label">Загрузите фото блюда</label>
            <input
                type="file"
                className="form-control"
                id="imageInput"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
}

export default ImageUploader;
