
import React, { useState } from 'react';
import { X, Camera, MapPin, Tag, DollarSign, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MealRecord } from '../types';
import { CATEGORY_COLORS, MORANDI_PRIMARY } from '../constants';

interface EditRecordModalProps {
  record: MealRecord;
  onClose: () => void;
  onUpdate: (id: string, updatedFields: Partial<MealRecord>) => void;
  onDelete: (id: string) => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({ record, onClose, onUpdate, onDelete }) => {
  const [shopName, setShopName] = useState(record.shopName);
  const [mealName, setMealName] = useState(record.mealName);
  const [price, setPrice] = useState(record.price.toString());
  const [image, setImage] = useState<string | undefined>(record.image);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(record.id, {
      shopName,
      mealName,
      price: Number(price),
      image
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#5D6D7E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FDFBF9] w-full max-w-md rounded-t-[48px] p-8 animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh] shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-[#5D6D7E]">檢視紀錄</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{record.category} 詳情</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { if(confirm('確定要刪除這筆紀錄嗎？')) onDelete(record.id); }} 
              className="p-3 bg-white hover:bg-red-50 rounded-full transition-colors border border-red-100 group"
            >
              <Trash2 size={20} className="text-red-300 group-hover:text-red-500" />
            </button>
            <button onClick={onClose} className="p-3 bg-white hover:bg-gray-50 rounded-full transition-colors border border-[#E5DCD3]/50">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 pb-6 hide-scrollbar">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">類別 Sector</label>
            <div className="flex">
               <div 
                 className="px-5 py-2.5 rounded-2xl text-[11px] font-black text-white shadow-md flex items-center gap-2"
                 style={{ backgroundColor: CATEGORY_COLORS[record.category] }}
               >
                 <div className="w-2 h-2 rounded-full bg-white/40"></div>
                 {record.category}
               </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">照片 Photo</label>
            <div 
              className="relative w-full aspect-square rounded-[32px] bg-white border border-[#E5DCD3] flex flex-col items-center justify-center overflow-hidden hover:border-[#5D6D7E]/30 transition-all cursor-pointer group shadow-inner"
              onClick={() => document.getElementById('editImageInput')?.click()}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#5D6D7E]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-[#FDFBF9] rounded-2xl shadow-sm flex items-center justify-center mb-2 border border-[#E5DCD3]/30">
                    <ImageIcon className="text-[#E5DCD3]" size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Update Photo</span>
                </>
              )}
              <input 
                id="editImageInput"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <MapPin size={16} className="text-[#E5DCD3]" />
              </div>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="店家名稱"
                required
                className="block w-full pl-12 pr-6 py-4 bg-white border border-[#E5DCD3]/50 rounded-[20px] text-sm text-[#5D6D7E] placeholder:text-gray-300 focus:ring-2 focus:ring-[#5D6D7E]/10 focus:border-[#5D6D7E]/30 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Tag size={16} className="text-[#E5DCD3]" />
              </div>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="餐點名稱"
                required
                className="block w-full pl-12 pr-6 py-4 bg-white border border-[#E5DCD3]/50 rounded-[20px] text-sm text-[#5D6D7E] placeholder:text-gray-300 focus:ring-2 focus:ring-[#5D6D7E]/10 focus:border-[#5D6D7E]/30 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-[#E5DCD3]" />
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="價格"
                required
                className="block w-full pl-12 pr-6 py-4 bg-white border border-[#E5DCD3]/50 rounded-[20px] text-sm text-[#5D6D7E] placeholder:text-gray-300 focus:ring-2 focus:ring-[#5D6D7E]/10 focus:border-[#5D6D7E]/30 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ backgroundColor: MORANDI_PRIMARY }}
            className="w-full py-5 text-white rounded-[24px] font-black text-lg hover:opacity-90 active:scale-[0.98] transition-all mt-6 shadow-xl"
          >
            儲存修改
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;
