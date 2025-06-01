import React from 'react';

interface PlaylistCoverProps {
  tracks: Array<{ coverUrl: string }>;
  playlistName: string;
  size?: number;
  className?: string;
}

// Выделяем отдельный компонент для совместимости с Fast Refresh
const PlaylistCover: React.FC<PlaylistCoverProps> = ({
  tracks,
  playlistName,
  size = 300,
  className,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const generateCover = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = size;
      canvas.height = size;

      // Очищаем холст
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, size, size);

      if (tracks.length === 0) {
        // Градиентный фон для пустого плейлиста
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Добавляем инициалы плейлиста
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${size * 0.25}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(playlistName.slice(0, 2).toUpperCase(), size / 2, size / 2);
      } else {
        const maxImages = Math.min(tracks.length, 4);
        const gridSize = maxImages === 1 ? 1 : 2;

        const promises = tracks.slice(0, maxImages).map((track) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
              // Создаём fallback изображение
              const fallbackCanvas = document.createElement('canvas');
              fallbackCanvas.width = size / gridSize;
              fallbackCanvas.height = size / gridSize;
              const fallbackCtx = fallbackCanvas.getContext('2d');
              if (fallbackCtx) {
                const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
                fallbackCtx.fillStyle = colors[promises.indexOf(promises[tracks.indexOf(track)]) % colors.length];
                fallbackCtx.fillRect(0, 0, size / gridSize, size / gridSize);
                
                // Добавляем номер трека
                fallbackCtx.fillStyle = 'white';
                fallbackCtx.font = `bold ${(size / gridSize) * 0.3}px Arial`;
                fallbackCtx.textAlign = 'center';
                fallbackCtx.textBaseline = 'middle';
                fallbackCtx.fillText((tracks.indexOf(track) + 1).toString(), (size / gridSize) / 2, (size / gridSize) / 2);
              }
              
              const fallbackImg = new Image();
              fallbackImg.src = fallbackCanvas.toDataURL();
              fallbackImg.onload = () => resolve(fallbackImg);
            };
            // Добавляем timestamp для избежания проблем с кешированием
            const imgSrc = track.coverUrl || '/placeholder.jpg';
            img.src = imgSrc.includes('http') ? imgSrc : `${imgSrc}?t=${new Date().getTime()}`;
          });
        });

        try {
          const images = await Promise.all(promises);
          
          images.forEach((img, index) => {
            const imgSize = size / gridSize;
            let x, y;

            if (gridSize === 1) {
              x = 0;
              y = 0;
            } else {
              x = (index % 2) * imgSize;
              y = Math.floor(index / 2) * imgSize;
            }

            // Рисуем изображение
            ctx.drawImage(img, x, y, imgSize, imgSize);

            // Добавляем тонкую границу между изображениями
            if (gridSize === 2) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, imgSize, imgSize);
            }
          });

          // Добавляем градиентный оверлей для лучшего вида
          const overlay = ctx.createLinearGradient(0, 0, size, size);
          overlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
          overlay.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
          ctx.fillStyle = overlay;
          ctx.fillRect(0, 0, size, size);
        } catch (error) {
          console.error('Error generating playlist cover:', error);
          
          // Fallback: создаём градиентный фон
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = `bold ${size * 0.2}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(playlistName.slice(0, 2).toUpperCase(), size / 2, size / 2);
        }
      }
    };

    generateCover();
  }, [tracks, playlistName, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ 
        width: size, 
        height: size,
        borderRadius: '8px',
        display: 'block'
      }}
    />
  );
};

// Утилитарная функция для генерации обложки без рендера компонента
// Исправляем для совместимости с Fast Refresh
export const generatePlaylistCover = async (
  tracks: Array<{ coverUrl: string }>,
  playlistName: string,
  size: number = 300
): Promise<string> => {
  return new Promise((resolve) => {
    // Создаем временный div для рендера компонента
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    document.body.appendChild(div);
    
    // Рендерим компонент в временный div
    const cleanup = () => {
      setTimeout(() => {
        document.body.removeChild(div);
      }, 100);
    };
    
    // Создаем временный канвас
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    div.appendChild(canvas);
    
    // Используем ту же логику, что и в компоненте
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cleanup();
      resolve('/placeholder.jpg');
      return;
    }
    
    // Остальная логика копирует логику из компонента...
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);
    
    if (!tracks || tracks.length === 0) {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `bold ${size * 0.25}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(playlistName.slice(0, 2).toUpperCase(), size / 2, size / 2);
      
      const result = canvas.toDataURL('image/png');
      cleanup();
      resolve(result);
      return;
    }
    
    const maxImages = Math.min(tracks.length, 4);
    const gridSize = maxImages === 1 ? 1 : 2;
    let loadedImages = 0;
    const images: HTMLImageElement[] = [];
    
    tracks.slice(0, maxImages).forEach((track, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        images[index] = img;
        loadedImages++;
        
        if (loadedImages === maxImages) {
          // Рисуем все загруженные изображения
          images.forEach((img, idx) => {
            if (!img) return;
            
            const imgSize = size / gridSize;
            const x = (idx % 2) * imgSize;
            const y = Math.floor(idx / 2) * imgSize;
            
            ctx.drawImage(img, x, y, imgSize, imgSize);
            
            if (gridSize === 2) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, imgSize, imgSize);
            }
          });
          
          const overlay = ctx.createLinearGradient(0, 0, size, size);
          overlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
          overlay.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
          ctx.fillStyle = overlay;
          ctx.fillRect(0, 0, size, size);
          
          const result = canvas.toDataURL('image/png');
          cleanup();
          resolve(result);
        }
      };
      
      img.onerror = () => {
        // Создаем fallback для ошибок загрузки
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = size / gridSize;
        fallbackCanvas.height = size / gridSize;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        
        if (fallbackCtx) {
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
          fallbackCtx.fillStyle = colors[index % colors.length];
          fallbackCtx.fillRect(0, 0, size / gridSize, size / gridSize);
          
          fallbackCtx.fillStyle = 'white';
          fallbackCtx.font = `bold ${(size / gridSize) * 0.3}px Arial`;
          fallbackCtx.textAlign = 'center';
          fallbackCtx.textBaseline = 'middle';
          fallbackCtx.fillText((index + 1).toString(), (size / gridSize) / 2, (size / gridSize) / 2);
          
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            images[index] = fallbackImg;
            loadedImages++;
            
            if (loadedImages === maxImages) {
              // То же самое что и выше
              images.forEach((img, idx) => {
                if (!img) return;
                
                const imgSize = size / gridSize;
                const x = (idx % 2) * imgSize;
                const y = Math.floor(idx / 2) * imgSize;
                
                ctx.drawImage(img, x, y, imgSize, imgSize);
                
                if (gridSize === 2) {
                  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(x, y, imgSize, imgSize);
                }
              });
              
              const overlay = ctx.createLinearGradient(0, 0, size, size);
              overlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
              overlay.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
              ctx.fillStyle = overlay;
              ctx.fillRect(0, 0, size, size);
              
              const result = canvas.toDataURL('image/png');
              cleanup();
              resolve(result);
            }
          };
          
          fallbackImg.src = fallbackCanvas.toDataURL();
        } else {
          loadedImages++;
          if (loadedImages === maxImages) {
            // Если все изображения привели к ошибке, отдаем градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `bold ${size * 0.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(playlistName.slice(0, 2).toUpperCase(), size / 2, size / 2);
            
            const result = canvas.toDataURL('image/png');
            cleanup();
            resolve(result);
          }
        }
      };
      
      const imgSrc = track.coverUrl || '/placeholder.jpg';
      img.src = imgSrc.includes('http') ? imgSrc : `${imgSrc}?t=${new Date().getTime()}`;
    });
  });
};

export default PlaylistCover;