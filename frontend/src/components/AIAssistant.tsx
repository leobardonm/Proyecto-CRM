'use client';

import { useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';

export default function AIAssistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    getClientCount,
    getNegotiationCount,
    getVendorCount,
    getProductCount,
    getCompanyCount,
    getVendors,
    getClients,
    getNegotiations,
    getProducts,
    getCompanies
  } = useDatabase();

  const handleSubmit = async () => {
    if (!question) return;
    setLoading(true);
    try {
      // Fetch necessary data for context
      const clients = await getClients();
      const vendors = await getVendors();
      const negotiations = await getNegotiations();
      const products = await getProducts();
      const companies = await getCompanies();
      const clientCount = await getClientCount();
      const vendorCount = await getVendorCount();
      const negotiationCount = await getNegotiationCount();
      const productCount = await getProductCount();
      const companyCount = await getCompanyCount();
      
      // Create context data for Gemini
      const contextData = {
        clientCount,
        vendorCount,
        negotiationCount,
        productCount,
        companyCount,
        clients,
        vendors,
        negotiations,
        products,
        companies
      };
      
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAoVy6DkV24fPESO_rgTj9D8upVWIeMD2U';
      
      const data = {
        contents: [{
          parts: [{ text: `Contexto: ${JSON.stringify(contextData)} \n\n Pregunta: ${question}` }]
        }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResponse(result.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error processing the request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pregunta a Gemini 
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Haz una pregunta..."
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={!question || loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Pensando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {response && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <h3 className="text-lg font-medium mb-2">Respuesta:</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}