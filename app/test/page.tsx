'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const testSimplePrompt = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/test-openai', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }
      
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">OpenAI Email Assistant Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={testSimplePrompt}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test OpenAI Connection'}
          </button>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Result:</h2>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Prompt for Email Generation</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="mb-2 font-medium">Context:</p>
            <p className="mb-4 text-gray-700">I need to request a week off work due to a family emergency. My boss is understanding but professional.</p>
            
            <p className="mb-2 font-medium">Tone:</p>
            <p className="text-gray-700">Professional</p>
          </div>
        </div>
      </div>
    </div>
  );
} 