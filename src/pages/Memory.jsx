import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Memory() {
  const [memories, setMemories] = useState([]);
  const [newFact, setNewFact] = useState('');

  const loadMemories = async () => {
    try {
      const res = await api.get('/memory/');
      setMemories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const addMemory = async () => {
    if (!newFact.trim()) return;
    try {
      await api.post('/memory/', { fact: newFact.trim() });
      setNewFact('');
      loadMemories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMemory = async (id) => {
    try {
      await api.delete(`/memory/${id}`);
      loadMemories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">🧠 Память ИИ</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          placeholder="Новый факт о вас..."
          className="flex-1 p-3 bg-gray-700 text-white rounded outline-none"
        />
        <button onClick={addMemory} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
          Добавить
        </button>
      </div>
      <ul className="space-y-2">
        {memories.map((m) => (
          <li key={m.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
            <span className="text-white">{m.fact}</span>
            <button onClick={() => deleteMemory(m.id)} className="text-red-400 hover:text-red-600">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}