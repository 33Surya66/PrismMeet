import { useState } from 'react';
import { Menu, X, Video, Users, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');

  function getInitials(nameOrEmail) {
    if (!nameOrEmail) return '';
    const parts = nameOrEmail.split(/\s+|@/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  const handleStartMeeting = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    });
    const data = await res.json();
    if (data.id) {
      navigate(`/meeting/${data.id}`);
      // Optionally show/copy link
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/20 border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                PRISM MEET
              </h1>
              <p className="text-xs text-gray-400">Advanced Video Conferencing</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Features
            </a>
            <a href="#architecture" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Architecture
            </a>
            <a href="#roadmap" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Roadmap
            </a>
            <a href="#analytics" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Analytics
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              onClick={handleStartMeeting}
            >
              Start Meeting
            </button>
            {!isLoggedIn ? (
              <>
                <button
                  className="px-5 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  onClick={() => navigate('/register')}
                >
                  Signup
                </button>
              </>
            ) : (
              <Avatar>
                <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-black/20 backdrop-blur-sm border border-blue-500/30"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-blue-500/30">
            <a href="#features" className="block text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#architecture" className="block text-gray-300 hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#roadmap" className="block text-gray-300 hover:text-white transition-colors">
              Roadmap
            </a>
            <a href="#analytics" className="block text-gray-300 hover:text-white transition-colors">
              Analytics
            </a>
            <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold" onClick={handleStartMeeting}>
              Start Meeting
            </button>
            {!isLoggedIn ? (
              <>
                <button className="w-full px-5 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="w-full px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors" onClick={() => navigate('/register')}>
                  Signup
                </button>
              </>
            ) : (
              <div className="flex justify-center mt-2">
                <Avatar>
                  <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
