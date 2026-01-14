import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Category, MealRecord } from '../types';
import { CATEGORIES, MORANDI_PRIMARY } from '../constants';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<MealRecord, 'id'>) => void;
  defaultDate: string;
  initialCategory?: Category;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  onClose,
  onSubmit,
  defaultDate,
  initialCategory
}) => {
  const [category, setCategory] = useState<Category>(initialCategory || '早餐');
  const [shopName, setShopName] = useState('');
  const [mealName, setMealName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!mealName || !shopName || !price) return;

    onSubmit({
      date: defaultDate,
      category,
      shopName,
      mealName,
      price: Number(price),
      image
    });

    // 🔑 提交後關閉 modal（體感會正常很多）
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-end justify-center bg-[#5D6D7E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FDFBF9] w-full max-w-md rounded-t-[48px] p-8 animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh] shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#5D6D7E]">紀錄美味</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">New Meal Entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-50 rounded-full border border-[#E5DCD3]/50"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pb-6 hide-scrollbar">
          {/* 類別 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">
              類別 Sector
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={category === cat ? { backgroundColor: MORANDI_PRIMARY } : {}}
                  className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all ${
                    category === cat
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-white text-gray-400 border border-[#E5DCD3]/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 照片 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">
              照片 Photo
            </label>
            <div
              className="relative w-full aspect-square rounded-[32px] bg-white border border-[#E5DCD3] flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-[#E5DCD3]" size={32} />
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* 表單 */}
          <div className="space-y-4">
            <input
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="店名"
              className="w-full px-4 py-4 rounded-[20px] border border-[#E5DCD3]/50"
            />
            <input
              value={mealName}
              onChange={e => setMealName(e.target.value)}
              placeholder="餐點"
              className="w-full px-4 py-4 rounded-[20px] border border-[#E5DCD3]/50"
            />
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="金額"
              className="w-full px-4 py-4 rounded-[20px] border border-[#E5DCD3]/50"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            style={{ backgroundColor: MORANDI_PRIMARY }}
            className="w-full py-5 text-white rounded-[24px] font-black text-lg shadow-xl hover:opacity-90 active:scale-[0.98]"
          >
            保存紀錄
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecordModal;
