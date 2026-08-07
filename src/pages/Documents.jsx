import { useState } from 'react';
import api from '../api/axios';

export default function Documents() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      await api.post('/documents/upload', formData);
      alert('Файл загружен!');
    } catch (err) {
      alert('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/documents/ask', { question: question.trim() });
      setAnswer(res.data.answer);
      setSources(res.data.sources || []);
    } catch (err) {
      alert('Ошибка при запросе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">📄 Документы</h2>
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-white" />
        <button onClick={uploadFile} disabled={loading} className="bg-blue-600 px-4 py-2 rounded ml-2 disabled:opacity-50">
          Загрузить
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Задать вопрос по документам..."
          className="flex-1 p-3 bg-gray-700 text-white rounded outline-none"
        />
        <button onClick={askQuestion} disabled={loading} className="bg-purple-600 px-4 py-2 rounded disabled:opacity-50">
          Спросить
        </button>
      </div>
      {answer && (
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-white whitespace-pre-wrap">{answer}</p>
          {sources.length > 0 && <p className="text-gray-400 text-sm mt-2">📎 Источники: {sources.join(', ')}</p>}
        </div>
      )}
    </div>
  );
}