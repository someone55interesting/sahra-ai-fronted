import React, { useState } from 'react';
import { 
  Send, FileText, Bot, User, Paperclip, Sparkles, Loader2, 
  LogOut, Lock, Mail, ArrowRight, UserCheck 
} from 'lucide-react';
import { apiClient } from './api/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Поля авторизации
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [authError, setAuthError] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Привет! Я Sahra AI. Чем могу помочь?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'chat' | 'document'>('chat');

  // Авторизация / Регистрация
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        // Регистрация со всеми требуемыми полями
        await apiClient.post('/auth/register', { 
          email, 
          password,
          first_name: firstName || 'User',
          last_name: lastName || 'Sahra'
        });
        setAuthMode('login');
      }

      // Логин (OAuth2 Form Data)
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const res = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const accessToken = res.data.access_token;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    } catch (err: any) {
      console.error("Auth error:", err.response?.data);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setAuthError(detail[0]?.msg || 'Ошибка заполнения полей');
      } else {
        setAuthError(detail || 'Ошибка авторизации. Проверь данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Загрузка документа
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
          text: `Документ "${res.data.filename || file.name}" загружен! Задай по нему любой вопрос.`,
        },
      ]);
    } catch (err) {
      alert('Ошибка при загрузке файла');
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщений
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
        // POST /documents/ask
        const res = await apiClient.post('/documents/ask', {
          question: currentQuery,
          filename: selectedFile.name,
        });

        const replyText = res.data.answer || res.data.response || res.data.message || 'Ответ получен.';

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: replyText,
            sources: res.data.sources,
          },
        ]);
      } else {
        // POST /search/  <--- ТОЧНЫЙ ЭНДПОИНТ ДЛЯ ЧАТА ИЗ ТВОЕГО SWAGGER!
        const res = await apiClient.post('/search/', {
          query: currentQuery,
        });

        const replyText = res.data.answer || res.data.response || res.data.result || res.data.message || JSON.stringify(res.data);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: typeof replyText === 'string' ? replyText : JSON.stringify(replyText),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Chat error:", error.response?.data);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `Ошибка сервера (${error.response?.status || '500'}). Проверь логи контейнера.`,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ЭКРАН ВХОДА / РЕГИСТРАЦИИ
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Sahra AI
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-center mb-2">
            {authMode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
          </h2>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <UserCheck className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Имя"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Фамилия"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email адрес"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-2xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-xs text-indigo-400 hover:underline transition cursor-pointer"
            >
              {authMode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН ЧАТА
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                mode === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Общий ИИ Поиск</span>
            </button>

            <button
              onClick={() => setMode('document')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                mode === 'document' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Анализ Docx/PDF</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <Paperclip className="w-6 h-6 text-indigo-400" />
              <span className="text-xs text-slate-300 font-medium text-center truncate max-w-full">
                {selectedFile ? selectedFile.name : 'Прикрепить документ'}
              </span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.docx" />
            </label>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-slate-950">
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-300">
              Режим: {mode === 'chat' ? 'Общий ИИ Поиск (/search/)' : `Документ (${selectedFile?.name || 'не выбран'})`}
            </span>
          </div>
        </header>

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
              <span>Sahra AI генерирует ответ...</span>
            </div>
          )}
        </div>

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
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-3.5 rounded-2xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
