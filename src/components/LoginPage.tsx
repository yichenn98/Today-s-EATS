import React, { useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import { User } from '../types';
import { MORANDI_PRIMARY } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// ✅ LINE/IG/FB 內建瀏覽器偵測（會被 Google 擋）
const isInAppBrowser = () => {
  const ua = navigator.userAgent || '';
  return /Line|FBAN|FBAV|Instagram|Messenger/i.test(ua);
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const blocked = useMemo(() => isInAppBrowser(), []);

  const loginWithGoogle = async () => {
    if (isLoading) return;

    // 🚫 在內嵌瀏覽器 / popup 會被擋的環境：無感，不做任何事
    if (blocked) return;

    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const fu = result.user;

      onLogin({
        name: fu.displayName ?? 'Google User',
        email: fu.email ?? '',
        avatar: fu.photoURL ?? '',
        provider: 'google',
      });
    } catch {
      // ❌ 不 alert、不 console、不提示
    } finally {
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
          disabled={isLoading || blocked}
          style={{ backgroundColor: MORANDI_PRIMARY }}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[24px] text-white font-bold text-sm shadow-lg hover:opacity-95 active:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
