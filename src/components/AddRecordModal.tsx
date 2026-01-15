import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Category, MealRecord } from '../types';
import { CATEGORIES, MORANDI_PRIMARY } from '../constants';
import { compressImageToDataUrl } from '../imageCompress';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<MealRecord, 'id'>) => void;
  defaultDate: string;
  initialCategory?: Category;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  initialCategory
}) => {
  const [category, setCategory] = useState<Category>(initialCategory || '早餐');
  const [shopName, setShopName] = useState('');
  const [mealName, setMealName] = useState('');
  const [price, setPrice] = useState(''); // 保留 string，讓 input number 提示正常
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  // ✅ 沒開就不渲染（避免蓋住頁面/吃點擊）
  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.75,
        targetBytes: 700_000,
      });
      setImage(dataUrl);
    } catch (err: any) {
      console.error('Image compress failed:', err);
      alert('照片太大或壓縮失敗，請換一張或截圖後再上傳。');
    } finally {
      setIsCompressing(false);
      // 讓同一張圖也能重新選到（有些瀏覽器需要）
      e.currentTarget.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 保留你的原本判斷（required 也會擋）
    if (!mealName || !shopName || !price) return;

    onSubmit({
      date: defaultDate,
      category,
      shopName,
      mealName,
      price: Number(price),
      image, // ✅ 壓縮後的 base64（小於安全上限）
    });

    // ✅ 提交後關閉（體感更順）
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-end justify-center bg-[#5D6D7E]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FDFBF9] w-full max-w-md rounded-t-[48px] p-8 animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[92vh] shadow-2xl pointer-events-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-[#5D6D7E]">紀錄餐點</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">New Meal Entry</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-white hover:bg-gray-50 rounded-full transition-colors border border-[#E5DCD3]/50"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 pb-6 hide-scrollbar">
          {/* 類別 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">
              類別 Sector
            </label>
            <div className="flex flex-wrap gap-2 px-1 overflow-visible">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={category === cat ? { backgroundColor: MORANDI_PRIMARY } : {}}
                  className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all origin-center ${
                    category === cat
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-white text-gray-400 border border-[#E5DCD3]/50 hover:bg-[#E5DCD3]/20'
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
              className="relative w-full aspect-square rounded-[32px] bg-white border border-[#E5DCD3] flex flex-col items-center justify-center overflow-hidden hover:border-[#5D6D7E]/30 transition-all cursor-pointer group shadow-inner"
              onClick={() => !isCompressing && document.getElementById('imageInput')?.click()}
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
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {isCompressing ? 'Compressing...' : 'Upload Meal Photo'}
                  </span>
                </>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {isCompressing && (
              <p className="text-[11px] text-gray-400">正在壓縮照片，請稍等一下…</p>
            )}
          </div>

          {/* 欄位 */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <MapPin size={16} className="text-[#E5DCD3]" />
              </div>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="在哪裡吃的？ (店名)"
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
                placeholder="吃了什麼好料？ (餐點)"
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
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="這餐花了多少錢？"
                required
                className="block w-full pl-12 pr-6 py-4 bg-white border border-[#E5DCD3]/50 rounded-[20px] text-sm text-[#5D6D7E] placeholder:text-gray-300 focus:ring-2 focus:ring-[#5D6D7E]/10 focus:border-[#5D6D7E]/30 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ backgroundColor: MORANDI_PRIMARY }}
            className="relative z-10 w-full py-5 text-white rounded-[24px] font-black text-lg hover:opacity-90 active:scale-[0.98] transition-all mt-6 shadow-xl pointer-events-auto"
          >
            保存紀錄
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
