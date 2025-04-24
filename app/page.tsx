'use client';

import { useState } from 'react';
import { PaperAirplaneIcon, InformationCircleIcon, ChevronDownIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import VoiceInput from '../components/VoiceInput';
import ImageUpload from '../components/ImageUpload';
import AudioOutput from '../components/AudioOutput';

export default function Home() {
  const [emailContext, setEmailContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState<string>('');
  const [generatedEmails, setGeneratedEmails] = useState<string[]>([]);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'voice', or 'document'
  const [showInstructions, setShowInstructions] = useState(false);
  const [examples, setExamples] = useState([
    "Request a deadline extension for a project",
    "Apply for a job position in tech",
    "Apologize for missing a meeting",
    "Request a letter of recommendation"
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedEmails([]);
    setSelectedEmailIndex(0);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: emailContext,
          tone,
          numVariations: 3,
          wordCount: wordCount.trim() ? parseInt(wordCount) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate emails');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle both legacy single email response and new multiple email format
      if (Array.isArray(data.emails) && data.emails.length > 0) {
        setGeneratedEmails(data.emails);
      } else if (data.email) {
        // Legacy support for single email response
        setGeneratedEmails([data.email]);
      } else {
        throw new Error('No email content received');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setEmailContext(transcript);
  };

  const handleDocumentText = (text: string) => {
    setEmailContext(text);
    setActiveTab('text'); // Switch to text tab to show extracted content
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const useExample = (example: string) => {
    setEmailContext(example);
  };

  // Function to handle selecting a different email variation
  const selectEmailVariation = (index: number) => {
    setSelectedEmailIndex(index);
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            Draftly <br />
            AI Email Drafting Assistant <br />
            <span className="text-gray-500 text-sm">
              Generate multiple email drafts using text, voice, or document scanning
            </span>
          </h1>
        
        </div>
        
        <div className="card p-6 slide-up">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <button
                className={`py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('text')}
              >
                <span className="flex items-center font-medium">
                  <LightBulbIcon className="h-4 w-4 mr-2" />
                  Type
                </span>
              </button>
              <button
                className={`py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === 'voice' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('voice')}
              >
                <span className="flex items-center font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Voice
                </span>
              </button>
              <button
                className={`py-2 px-4 rounded-md transition-all duration-200 ${
                  activeTab === 'document' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('document')}
              >
                <span className="flex items-center font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Document
                </span>
              </button>
            </div>
            
            <button
              onClick={toggleInstructions}
              className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm transition-colors duration-200"
            >
              <InformationCircleIcon className="h-5 w-5 mr-1" />
              <span>Help</span>
            </button>
          </div>
          
          {showInstructions && (
            <div className="glass-effect p-4 rounded-lg mb-6 text-sm slide-up">
              <h3 className="font-medium text-indigo-800 mb-2">How to use this tool:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {activeTab === 'text' && (
                  <>
                    <li>Type your email context in the text area</li>
                    <li>Select your preferred tone</li>
                    <li>Click "Generate Emails" to create multiple draft options</li>
                    <li>Browse through the options using the tabs above each email</li>
                  </>
                )}
                
                {activeTab === 'voice' && (
                  <>
                    <li><strong>Browser compatibility:</strong> Works best in Chrome, Edge, or Safari</li>
                    <li>Click the microphone button and allow microphone access when prompted</li>
                    <li>Speak clearly - your words will appear in the text box</li>
                    <li>Click the stop button when finished</li>
                    <li>Edit the text if needed before generating your emails</li>
                  </>
                )}
                
                {activeTab === 'document' && (
                  <>
                    <li>Click "Upload Document" to select an image containing text</li>
                    <li>Supported formats: JPG, PNG, GIF (under 5MB)</li>
                    <li>The text will be extracted using OCR and appear in the text box</li>
                    <li>Edit the extracted text if needed before generating your emails</li>
                    <li>For best results, use clear images with good contrast</li>
                  </>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="emailContext" className="block text-sm font-medium text-gray-700">
                    What would you like to write about?
                  </label>
                  <div className="relative group">
                    <button 
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => document.getElementById('example-dropdown')?.classList.toggle('hidden')}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <div id="example-dropdown" className="hidden absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 py-1 text-sm">
                      <div className="px-3 py-2 border-b text-xs font-medium text-gray-500">Example prompts</div>
                      {examples.map((example, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => useExample(example)}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {activeTab === 'voice' && (
                  <VoiceInput onTranscriptChange={handleVoiceTranscript} />
                )}
                
                {activeTab === 'document' && (
                  <ImageUpload onTextExtracted={handleDocumentText} />
                )}
              </div>
              
              <textarea
                id="emailContext"
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
                className="input-field min-h-[150px]"
                placeholder={
                  activeTab === 'text'
                    ? "Enter the context of your email..."
                    : activeTab === 'voice'
                    ? "Your voice input will appear here..."
                    : "Scanned document text will appear here..."
                }
                required
              />
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Select Tone
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="input-field"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
                Approximate Word Count <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                id="wordCount"
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                placeholder="e.g., 100, 200, etc."
                className="input-field"
                min="50"
                max="500"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for default length</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailContext.trim()}
              className="btn-primary w-full flex items-center justify-center py-3"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                  <span className="ml-2">Generating...</span>
                </div>
              ) : (
                <span className="flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Generate Emails
                </span>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-100 slide-up">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {generatedEmails.length > 0 && (
            <div className="mt-8 slide-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Generated Emails:</h2>
                <AudioOutput text={generatedEmails[selectedEmailIndex]} />
              </div>
              
              {/* Email variation tabs */}
              <div className="flex mb-4 border-b border-gray-200">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => selectEmailVariation(index)}
                    className={`py-2 px-4 font-medium text-sm mr-2 ${
                      selectedEmailIndex === index
                        ? 'tab-active'
                        : 'tab-inactive'
                    }`}
                  >
                    Version {index + 1}
                  </button>
                ))}
              </div>
              
              {/* Email content */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{generatedEmails[selectedEmailIndex]}</pre>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedEmails[selectedEmailIndex]);
                  }}
                  className="btn-secondary text-sm"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-10 text-center text-sm text-gray-500">
          <p>Powered by Groq AI • Draftly</p>
        </footer>
      </div>
    </div>
  );
} 