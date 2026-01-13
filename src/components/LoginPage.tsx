
import React from 'react';
import { User } from '../types';
import { MORANDI_PRIMARY } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const simulateLogin = (provider: 'google' | 'line') => {
    const mockUser: User = {
      name: provider === 'google' ? 'Google User' : 'Line User',
      email: 'user@example.com',
      avatar: `https://picsum.photos/seed/${provider}/200`,
      provider
    };
    onLogin(mockUser);
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-10">
      <div className="mb-16 text-center">
        <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_-10px_rgba(93,109,126,0.1)] border border-[#E5DCD3]/30">
          <span className="text-5xl">🥣</span>
        </div>
        <h1 className="text-3xl font-black text-[#5D6D7E] tracking-tight mb-2">今天吃什麼</h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.4em]">Dietary Journal</p>
      </div>

      <div className="w-full space-y-5">
        <button 
          onClick={() => simulateLogin('google')}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border border-[#E5DCD3]/60 rounded-[24px] hover:bg-gray-50 transition-all text-[#5D6D7E] font-bold text-sm shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google 快速登入
        </button>
        
        <button 
          onClick={() => simulateLogin('line')}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-[#ABB6A4] text-white rounded-[24px] hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-[#ABB6A4]/20"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.777.039 1.083l-.171 1.027c-.052.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.571-3.951 2.571-5.993zm-17.781 5.48h-1.631c-.301 0-.547-.245-.547-.547V8.587c0-.301.246-.547.547-.547.301 0 .547.246.547.547v6.119h1.084c.301 0 .547.246.547.547 0 .302-.246.547-.547.547zm3.93 0h-1.63c-.301 0-.547-.245-.547-.547V8.587c0-.301.246-.547.547-.547.302 0 .547.246.547.547v6.66c0 .302-.245.547-.547.547zm4.364-6.119c-.27-.373-.665-.541-1.189-.541h-1.619c-.301 0-.547.246-.547.547v6.66c0 .302.246.547.547.547h1.619c1.01 0 1.954-.64 1.954-1.905V10.19c0-.2-.057-.373-.146-.525zm-.619 4.214c0 .484-.367.811-.861.811h-.54V9.134h.54c.494 0 .861.327.861.811v3.94zm6.052 1.905h-2.12c-.302 0-.547-.245-.547-.547V8.587c0-.301.245-.547.547-.547h2.12c.302 0 .547.246.547.547 0 .302-.245.547-.547.547h-1.573v1.838h1.161c.302 0 .547.246.547.547s-.245.547-.547.547h-1.161v1.859h1.573c.302 0 .547.246.547.547 0 .302-.245.547-.547.547z"/>
          </svg>
          Line 帳號登入
        </button>
      </div>

      <p className="mt-20 text-[10px] text-gray-300 text-center leading-relaxed tracking-widest uppercase">
        By continuing, you agree to our<br/>
        <span className="text-[#5D6D7E] font-bold underline cursor-pointer">Terms</span> & <span className="text-[#5D6D7E] font-bold underline cursor-pointer">Privacy</span>
      </p>
    </div>
  );
};

export default LoginPage;
