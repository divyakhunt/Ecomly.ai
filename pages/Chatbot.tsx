import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { ChatMessage } from '../types';
import type { Chat } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { Icon } from '../components/Icon';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [botReplyCount, setBotReplyCount] = useState(0);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (botReplyCount >= 2) {
      scrollToBottom();
    }
  }, [messages, botReplyCount]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    const systemInstruction = "You are a friendly and helpful AI assistant for an e-commerce platform. Your primary goals are: 1. Help users with product recommendations based on their needs. 2. Answer queries about orders, shipping, and returns. 3. Provide information from frequently asked questions. Be concise, polite, and always aim to resolve the user's issue effectively.";
    try {
        chatRef.current = geminiService.startChat(systemInstruction);
        setMessages([
            {
                id: 'initial-bot',
                role: 'bot',
                text: "Hello! I'm your E-Commerce AI Assistant. How can I help you with products, orders, or anything else today?"
            }
        ]);
    } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([{ id: 'error-initial', role: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    }
  }, []);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botMessageId, role: 'bot', text: '' }]);

    try {
        const stream = await chatRef.current.sendMessageStream({ message: currentInput });
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk.text;
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
                )
            );
        }
    } catch (error) {
        console.error('Error sending message:', error);
        const errorText = 'Sorry, something went wrong. Please try again.';
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: errorText } : msg
            )
        );
    } finally {
        setIsLoading(false);
        setBotReplyCount(prev => prev + 1);
    }
  };

  return (
    <PageWrapper
      title="E-Commerce Assistant"
      description="Your personal AI helper for product recommendations, order queries, and support."
    >
      <motion.div 
        className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/60 rounded-xl shadow-2xl w-full h-[70vh] flex flex-col min-h-0"
      >

        <div className="flex-grow p-6 overflow-y-auto min-h-0">
          <div className="space-y-4">
              {messages.map((message) => (
                 <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'bot' && (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-md border border-slate-600">
                      <Icon name="logo" className="w-5 h-5 text-blue-400"/>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-sm md:max-w-md shadow-md ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {message.text ? message.text : (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                  </div>
                 </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-slate-800/60 p-4 bg-slate-900/50 rounded-b-xl">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <div className="relative w-full">
              <motion.div
                className="absolute -inset-px border border-blue-500/0 rounded-full pointer-events-none"
                animate={{
                  borderColor: isLoading || input.length > 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0)',
                  boxShadow: isLoading ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none',
                }}
                transition={{ 
                  repeat: isLoading ? Infinity : 0, 
                  repeatType: 'reverse', 
                  duration: isLoading ? 1.2 : 0.3,
                  ease: 'easeInOut'
                }}
              />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, orders, or support..."
                className="relative w-full px-5 py-2.5 bg-slate-800/50 border border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all duration-300"
                disabled={isLoading}
              />
            </div>
            <motion.button
              type="submit"
              data-umami-event="Chatbot Message Sending Button"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
              aria-label="Send message"
            >
              <Icon name="send" className="w-5 h-5"/>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default Chatbot;