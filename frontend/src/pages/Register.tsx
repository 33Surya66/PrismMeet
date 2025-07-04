import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError('Signup failed: ' + (text || res.statusText));
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.token) {
        let userObj = data.user || {};
        if (!userObj.name && userObj.email) userObj.name = userObj.email;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        console.log('Saved user to localStorage:', userObj);
        navigate('/');
      } else {
        setError('Signup failed: Invalid response from server');
      }
    } catch (err) {
      setError('Signup failed: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-black">
      <form onSubmit={handleSubmit} className="bg-slate-800/90 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Register</h2>
        {error && <div className="text-red-400 text-center">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-lg disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="text-center text-gray-400">
          Already have an account?{' '}
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => navigate('/login')}>
            Login
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register; 