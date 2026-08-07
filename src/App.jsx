import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import SearchChat from './pages/SearchChat';
import Conversations from './pages/Conversations';
import Memory from './pages/Memory';
import Documents from './pages/Documents';
import YouTube from './pages/YouTube';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-4">Загрузка...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-900">
                  <Navbar />
                  <div className="p-4 max-w-4xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Conversations />} />
                      <Route path="/chat/:conversationId?" element={<Chat />} />
                      <Route path="/search-chat" element={<SearchChat />} />
                      <Route path="/memory" element={<Memory />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/youtube" element={<YouTube />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;