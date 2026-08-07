import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Регистрация</h2>
        {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-3 mb-4 bg-gray-700 text-white rounded" required />
        <input name="first_name" placeholder="Имя" value={form.first_name} onChange={handleChange} className="w-full p-3 mb-4 bg-gray-700 text-white rounded" />
        <input name="last_name" placeholder="Фамилия" value={form.last_name} onChange={handleChange} className="w-full p-3 mb-4 bg-gray-700 text-white rounded" />
        <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} className="w-full p-3 mb-4 bg-gray-700 text-white rounded" required />
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded">Зарегистрироваться</button>
        <p className="text-gray-400 mt-4 text-center">
          Уже есть аккаунт? <Link to="/login" className="text-blue-400">Войти</Link>
        </p>
      </form>
    </div>
  );
}