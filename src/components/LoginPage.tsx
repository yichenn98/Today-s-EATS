import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../types';
import { MORANDI_PRIMARY } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const fu = result.user;

      onLogin({
        name: fu.displayName ?? 'Google User',
        email: fu.email ?? '',
        avatar: fu.photoURL ?? '',
        provider: 'google',
      });
    } catch (e: any) {
  console.warn('Google popup login failed:', e);

  // popup 被擋（最常見）
  if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
    alert('登入視窗被瀏覽器擋下了：請允許彈出式視窗（Popup）後再試一次。');
  } else {
    alert(`登入失敗：${e?.code ?? ''} ${e?.message ?? e}`);
  }
}
 finally {
      setIsLoading(false);
    }
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

      <div className="w-full">
        <button
          onClick={loginWithGoogle}
          disabled={isLoading}
          style={{ backgroundColor: MORANDI_PRIMARY }}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[24px] text-white font-bold text-sm shadow-lg hover:opacity-95 active:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? '登入中…' : '使用 Google 登入'}
        </button>
      </div>

      <p className="mt-20 text-[10px] text-gray-300 text-center leading-relaxed tracking-widest uppercase">
        By continuing, you agree to our<br />
        <span className="text-[#5D6D7E] font-bold underline cursor-pointer">Terms</span> &{' '}
        <span className="text-[#5D6D7E] font-bold underline cursor-pointer">Privacy</span>
      </p>
    </div>
  );
};

export default LoginPage;

