import React, { useState } from 'react';
import { Send, FileText, Bot, User, Paperclip, Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from './api/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Привет! Я Sahra AI. Чем могу помочь сегодня? Можешь просто пообщаться со мной или загрузить документ для анализа.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'chat' | 'document'>('chat');

  // Обработка загрузки файла
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setSelectedFile(file);

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const res = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMode('document');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Документ "${res.data.filename || file.name}" успешно проанализирован и сохранен в базу! Теперь ты можешь задавать по нему любые вопросы.`,
        },
      ]);
    } catch (err) {
      alert('Ошибка при загрузке файла');
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщения
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setIsLoading(true);

    try {
      if (mode === 'document' && selectedFile) {
        // Запрос к RAG (по документам)
        const res = await apiClient.post('/documents/ask', {
          question: currentQuery,
          filename: selectedFile.name,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: res.data.answer,
            sources: res.data.sources,
          },
        ]);
      } else {
        // Обычный чат с Ollama (ИИ Поиск)
        const res = await apiClient.post('/search/ask', {
          query: currentQuery,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: res.data.answer || res.data.response || 'Ошибка получения ответа',
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Не удалось получить ответ от сервера. Проверь подключение.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Сайдбар */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Sahra AI
            </h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setMode('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                mode === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Обычный Чат</span>
            </button>

            <button
              onClick={() => setMode('document')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                mode === 'document' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Анализ Docx/PDF</span>
            </button>
          </nav>
        </div>

        {/* Загрузка файла */}
        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <Paperclip className="w-6 h-6 text-indigo-400" />
            <span className="text-xs text-slate-300 font-medium text-center">
              {selectedFile ? selectedFile.name : 'Загрузить документ'}
            </span>
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.docx" />
          </label>
        </div>
      </aside>

      {/* Основная зона чата */}
      <main className="flex-1 flex flex-col h-full bg-slate-950">
        {/* Хедер */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-300">
              Режим: {mode === 'chat' ? 'Общий ИИ Поиск' : `Документ (${selectedFile?.name || 'не выбран'})`}
            </span>
          </div>
        </header>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-400" />}
              </div>

              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800 text-xs text-indigo-400">
                    Источники: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 items-center text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Sahra AI думает...</span>
            </div>
          )}
        </div>

        {/* Форма ввода */}
        <footer className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'document' ? 'Задай вопрос по документу...' : 'Спроси о чем угодно...'
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-3.5 rounded-2xl transition shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
