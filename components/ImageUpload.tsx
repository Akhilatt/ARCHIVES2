'use client';

import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { DocumentArrowUpIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface ImageUploadProps {
  onTextExtracted: (text: string) => void;
}

// Use a more basic type for logger data
interface LoggerData {
  status: string;
  progress: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Reset previous state
    setError('');
    setProgress(0);
    setFileName(file.name);
    
    // Check file size - limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Please select an image under 5MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    
    setIsProcessing(true);
    
    try {
      // Simplified worker creation with basic logger function
      const worker = await createWorker();
      
      // Set up progress logging
      worker.setParameters({
        tessedit_ocr_engine_mode: '1',
      });
      
      // Load and initialize worker
      await worker.load();
      setProgress(20);
      
      await worker.loadLanguage('eng');
      setProgress(40);
      
      await worker.initialize('eng');
      setProgress(60);
      
      // Recognize text in image
      const { data } = await worker.recognize(imageUrl);
      setProgress(90);
      
      // Clean up
      await worker.terminate();
      setProgress(100);
      
      if (data.text && data.text.trim() !== '') {
        onTextExtracted(data.text);
      } else {
        setError('No text detected in image. Please try a clearer image.');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setError('Failed to process image. Please try another image or format (JPG/PNG).');
    } finally {
      setIsProcessing(false);
      // We keep the preview URL for user reference
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="image-upload"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleImageUpload}
        className="sr-only"
        disabled={isProcessing}
      />
      
      <label
        htmlFor="image-upload"
        className={`flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium 
                  ${isProcessing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer'
                  } transition-all duration-200`}
      >
        {isProcessing ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{`Processing... ${progress}%`}</span>
          </div>
        ) : (
          <>
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
            <span>Upload Document</span>
          </>
        )}
      </label>
      
      {(error || fileName) && (
        <div className={`mt-2 text-xs ${error ? 'text-red-500 slide-up' : 'text-gray-500 fade-in'} flex items-start`}>
          {error ? (
            <>
              <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{fileName}</span>
            </>
          )}
        </div>
      )}
      
      {previewUrl && !error && !isProcessing && (
        <div className="absolute right-0 -mt-8 -mr-2">
          <div 
            className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden hover:w-16 hover:h-16 transition-all duration-300 shadow-sm"
            title="Image preview"
          >
            <img 
              src={previewUrl} 
              alt="Document preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 