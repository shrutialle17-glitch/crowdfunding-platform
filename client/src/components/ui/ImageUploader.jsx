import React, { useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';

export const ImageUploader = ({ label, multiple = false, files, setFiles, error }) => {
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (multiple) {
        setFiles(prev => [...prev, ...selectedFiles].slice(0, 5)); // Limit to 5
      } else {
        setFiles(selectedFiles.slice(0, 1));
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-border/50 transition-colors ${error ? 'border-red-500' : 'border-border'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 text-text-secondary mb-2" />
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-text-secondary">PNG, JPG or WEBP (MAX. 5MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple={multiple} 
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
        />
      </label>

      {error && <span className="text-xs text-red-500">{error}</span>}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
              <img 
                src={URL.createObjectURL(file)} 
                alt="preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-surface/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
