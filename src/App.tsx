import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, BarChart3, Target, LogOut } from 'lucide-react';
import { User, MealRecord, ViewType, Category } from './types';
import RecordsPage from './components/RecordsPage';
import StatsPage from './components/StatsPage';
import WheelPage from './components/WheelPage';
import LoginPage from './components/LoginPage';
import AddRecordModal from './components/AddRecordModal';
import EditRecordModal from './components/EditRecordModal';
import { MORANDI_PRIMARY } from './constants';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { subscribeRecords, upsertRecord, removeRecord } from './cloud';

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=User&background=E5DCD3&color=5D6D7E';

// ✅ Firestore 不接受 undefined：通通清掉（但保留 image/base64）
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  // Firebase Auth：監聽登入狀態（換裝置/清快取都能恢復）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fu) => {
      if (!fu) {
        setUid(null);
        setUser(null);
        setRecords([]);
        return;
      }

      setUid(fu.uid);
      setUser({
        name: fu.displayName ?? 'User',
        email: fu.email ?? '',
        avatar: fu.photoURL ?? FALLBACK_AVATAR,
        provider: 'google',
      });
    });

    return () => unsub();
  }, []);

  // Firestore：登入後即時同步 records
  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeRecords(uid, setRecords);
    return () => unsub();
  }, [uid]);

  const [activeTab, setActiveTab] = useState<ViewType>('records');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MealRecord | null>(null);
  const [preselectedCategory, setPreselectedCategory] = useState<Category | undefined>(undefined);

  // LoginPage 會 onLogin，但我們用 Firebase 真正狀態為準，這裡只做「保持相容」
  const handleLogin = (_u: User) => {
    // Firebase onAuthStateChanged 會自動更新 user
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ✅ 新增：保留 image（壓縮後的 base64），但清掉 undefined
  const addRecord = async (newRecord: Omit<MealRecord, 'id'>) => {
    if (!uid) {
      alert('登入狀態尚未完成，請稍等 1 秒或重新整理後再試一次。');
      return;
    }

    const recordWithId: MealRecord = {
      ...newRecord,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    try {
      const cleaned = cleanUndefined(recordWithId);
      await upsertRecord(uid, cleaned);

      setIsAddModalOpen(false);
      setPreselectedCategory(undefined);
    } catch (e: any) {
      console.error('addRecord failed:', e);
      alert(`新增失敗：${e?.code ?? ''} ${e?.message ?? e}`);
    }
  };

  // ✅ 更新：保留 image（壓縮後的 base64），但清掉 undefined
  const updateRecord = async (id: string, updatedFields: Partial<MealRecord>) => {
    if (!uid) {
      alert('登入狀態尚未完成，請稍等 1 秒或重新整理後再試一次。');
      return;
    }

    const current = records.find((r) => r.id === id);
    if (!current) return;

    const merged: MealRecord = { ...current, ...updatedFields };

    try {
      const cleaned = cleanUndefined(merged);
      await upsertRecord(uid, cleaned);
      setEditingRecord(null);
    } catch (e: any) {
      console.error('updateRecord failed:', e);
      alert(`更新失敗：${e?.code ?? ''} ${e?.message ?? e}`);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!uid) {
      alert('登入狀態尚未完成，請稍等 1 秒或重新整理後再試一次。');
      return;
    }

    try {
      await removeRecord(uid, id);
      setEditingRecord(null);
    } catch (e: any) {
      console.error('deleteRecord failed:', e);
      alert(`刪除失敗：${e?.code ?? ''} ${e?.message ?? e}`);
    }
  };

  const handleOpenAddModal = (cat?: Category) => {
    setPreselectedCategory(cat);
    setIsAddModalOpen(true);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFBF9] shadow-2xl flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || FALLBACK_AVATAR}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-[#E5DCD3]"
          />
          <h1 className="font-bold text-[#5D6D7E] text-lg tracking-tight">今天吃什麼</h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-[#D5A6A3] transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {activeTab === 'records' && (
          <RecordsPage
            records={records}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onEditRecord={setEditingRecord}
            onAddAtCategory={handleOpenAddModal}
          />
        )}
        {activeTab === 'stats' && <StatsPage records={records} />}
        {activeTab === 'wheel' && <WheelPage records={records} uid={uid} />}
      </main>

      {/* Floating Action Button */}
      {activeTab === 'records' && (
        <button
          onClick={() => handleOpenAddModal()}
          style={{ backgroundColor: MORANDI_PRIMARY }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(93,109,126,0.3)] hover:scale-110 active:scale-90 transition-all z-20 animate-in zoom-in duration-300"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-[#E5DCD3]/50 py-3 grid grid-cols-3 items-center z-10">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'records' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <LayoutGrid size={22} strokeWidth={activeTab === 'records' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">紀錄</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'stats' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <BarChart3 size={22} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">統計</span>
        </button>

        <button
          onClick={() => setActiveTab('wheel')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'wheel' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <Target size={22} strokeWidth={activeTab === 'wheel' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">轉盤</span>
        </button>
      </nav>

      {isAddModalOpen && (
        <AddRecordModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={addRecord}
          defaultDate={selectedDate}
          initialCategory={preselectedCategory}
        />
      )}

      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onUpdate={updateRecord}
          onDelete={deleteRecord}
        />
      )}
    </div>
  );
};

export default App;
