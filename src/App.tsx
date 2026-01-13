
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('eats_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [records, setRecords] = useState<MealRecord[]>(() => {
    try {
      const saved = localStorage.getItem('eats_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load records:", e);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<ViewType>('records');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MealRecord | null>(null);
  const [preselectedCategory, setPreselectedCategory] = useState<Category | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem('eats_records', JSON.stringify(records));
    } catch (e) {
      console.error("Storage quota exceeded:", e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("儲存空間已滿！請嘗試刪除舊紀錄。");
      }
    }
  }, [records]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('eats_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eats_user');
  };

  const addRecord = (newRecord: Omit<MealRecord, 'id'>) => {
    const recordWithId: MealRecord = {
      ...newRecord,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setRecords(prev => [...prev, recordWithId]);
    setIsAddModalOpen(false);
    setPreselectedCategory(undefined);
  };

  const updateRecord = (id: string, updatedFields: Partial<MealRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    setEditingRecord(null);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setEditingRecord(null);
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
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-[#E5DCD3]" />
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
        {activeTab === 'wheel' && <WheelPage records={records} />}
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
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'records' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <LayoutGrid size={22} strokeWidth={activeTab === 'records' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">紀錄</span>
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <BarChart3 size={22} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">統計</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('wheel')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'wheel' ? 'text-[#5D6D7E] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
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
