import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded password as requested
    if (password === 'balletjazz') { // You can change this
      // Ideally use a context or session storage to keep logged in state, 
      // but for this simple request, we might just navigate. 
      // However, without state, refreshing dashboard might kick out.
      // I'll set a simple sessionStorage flag.
      sessionStorage.setItem('isAdmin', 'true');
      navigate('dashboard');
    } else {
      alert('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-rose-100 rounded-full text-rose-500">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all"
              placeholder="Digite a senha..."
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-rose-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
