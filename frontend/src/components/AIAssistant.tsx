'use client';

import { useState, useEffect } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { ChatMessage } from './chat/chat-message';
import { ChatInput } from './chat/chat-input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
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

  useEffect(() => {
    // Add welcome message when component mounts
    setMessages([{
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de CRM. ¿En qué puedo ayudarte hoy? Puedo ayudarte con:\n\n• Información sobre clientes y vendedores\n• Detalles de negociaciones\n• Estadísticas y reportes\n• Cualquier otra consulta sobre tu CRM'
    }]);
  }, []);

  const handleSubmit = async (question: string) => {
    if (!question) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);
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
      const responseText = result.candidates[0].content.parts[0].text;
      
      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing the request' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-lg border border-gray-700 bg-[#1e293b] shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>
      <div className="border-t border-gray-700">
        <ChatInput
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}