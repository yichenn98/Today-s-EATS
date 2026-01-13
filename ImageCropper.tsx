
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, Move, RotateCcw } from 'lucide-react';
import { MORANDI_PRIMARY } from '../constants';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [initialScale, setInitialScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [imageSrc]);

  const handleImageLoad = () => {
    if (!imgRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const img = imgRef.current;
    
    // Calculate scale to fit the image into the container (covering the 1:1 area)
    const containerSize = container.offsetWidth;
    const scaleX = containerSize / img.naturalWidth;
    const scaleY = containerSize / img.naturalHeight;
    
    // We want "cover" behavior for the 1:1 square
    const fitScale = Math.max(scaleX, scaleY);
    
    setInitialScale(fitScale);
    setImageLoaded(true);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getCroppedImage = () => {
    if (!imgRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const outputSize = 800; // High quality 800x800
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // The visual square is 80% of container width
    const cropBoxSize = containerRect.width * 0.8;
    const cropBoxLeft = (containerRect.width - cropBoxSize) / 2;
    const cropBoxTop = (containerRect.height - cropBoxSize) / 2;

    // Current displayed size of image
    const displayedWidth = img.naturalWidth * initialScale * zoom;
    const displayedHeight = img.naturalHeight * initialScale * zoom;

    // Image position relative to container center
    const imgLeft = (containerRect.width / 2) + offset.x - (displayedWidth / 2);
    const imgTop = (containerRect.height / 2) + offset.y - (displayedHeight / 2);

    // Calculate how much of the original image is inside the crop box
    const scaleFactor = img.naturalWidth / displayedWidth;
    
    const sx = (cropBoxLeft - imgLeft) * scaleFactor;
    const sy = (cropBoxTop - imgTop) * scaleFactor;
    const sWidth = cropBoxSize * scaleFactor;
    const sHeight = cropBoxSize * scaleFactor;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);
    onCrop(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#5D6D7E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6 text-white px-2">
          <div>
            <h3 className="text-xl font-black tracking-tight">裁切美食照片</h3>
            <p className="text-[10px] opacity-60 uppercase font-bold tracking-[0.2em]">Adjust Visual Focus</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cropping Area */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square bg-[#1a1a1a] rounded-[48px] overflow-hidden cursor-move touch-none border-4 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="To crop"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              width: `${imageLoaded ? imgRef.current?.naturalWidth! * initialScale : 0}px`,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              visibility: imageLoaded ? 'visible' : 'hidden'
            }}
            className="max-w-none max-h-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
          />
          
          {/* Visual Crop Box Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             {/* Dimmed background around crop area */}
             <div className="absolute inset-0 shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] rounded-none"></div>
             {/* The actual 1:1 box */}
             <div className="w-[80%] aspect-square border-2 border-white/60 border-dashed rounded-3xl z-10 box-content"></div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white/80 border border-white/10">
             <Move size={12} />
             <span className="text-[10px] font-black uppercase tracking-widest">拖曳照片位置</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full mt-8 space-y-6">
          <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[32px] backdrop-blur-md border border-white/10">
            <button onClick={resetPosition} className="text-white/40 hover:text-white transition-colors">
              <RotateCcw size={18} />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <ZoomIn size={18} className="text-white/30" />
              <input 
                type="range" 
                min="0.8" 
                max="4" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#D5A6A3] h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-black text-white/40 w-8">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/70 rounded-[28px] font-bold text-sm transition-all border border-white/5"
            >
              取消
            </button>
            <button 
              onClick={getCroppedImage}
              style={{ backgroundColor: '#D5A6A3' }}
              className="flex-[2] py-5 text-white rounded-[28px] font-black text-sm shadow-[0_20px_40px_-10px_rgba(213,166,163,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Check size={20} strokeWidth={3} />
              完成裁切
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
