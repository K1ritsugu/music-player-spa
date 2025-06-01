g# Music Player - Руководство по изображениям

## Структура изображений

Изображения для музыкального плеера организованы в следующую структуру:

```
public/
  images/
    albums/           # Обложки альбомов
      *.svg          # SVG файлы для масштабируемости
      *.jpg          # Альтернативные JPG файлы
```

## Добавление новых изображений

### 1. Обложки альбомов

Поместите изображения обложек в папку `public/images/albums/`. Рекомендуемые форматы:
- **SVG** - для масштабируемых векторных изображений
- **JPG/PNG** - для растровых изображений (рекомендуемый размер: 300x300px)

### 2. Обновление базы данных

В файле `db.json` обновите поле `coverUrl` для соответствующих треков:

```json
{
  "id": "1",
  "title": "Название трека",
  "artist": "Исполнитель",
  "album": "Альбом",
  "coverUrl": "/images/albums/название-файла.svg"
}
```

### 3. Создание SVG обложек

Для создания простых SVG обложек используйте следующий шаблон:

```svg
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#grad1)" />
  <text x="150" y="140" font-family="Arial, sans-serif" font-size="18" 
        font-weight="bold" fill="white" text-anchor="middle">Исполнитель</text>
  <text x="150" y="165" font-family="Arial, sans-serif" font-size="18" 
        font-weight="bold" fill="white" text-anchor="middle">Альбом</text>
</svg>
```

## Текущие изображения

Следующие обложки уже созданы и настроены:

1. **Queen - A Night at the Opera** (`queen-night-opera.svg`)
2. **Eagles - Hotel California** (`eagles-hotel-california.svg`)
3. **Michael Jackson - Thriller** (`michael-jackson-thriller.svg`)
4. **Led Zeppelin - Led Zeppelin IV** (`led-zeppelin-iv.svg`)
5. **John Lennon - Imagine** (`john-lennon-imagine.svg`)

## Fallback изображения

Если изображение не найдено, приложение автоматически будет использовать:
- `placeholder.jpg` - для основных изображений
- `placeholder.svg` - для векторных изображений

## Автоматическое обновление

После изменения файлов в папке `public/`, json-server автоматически обслуживает их через:
- `http://localhost:3001/images/albums/файл.svg`
- `http://localhost:3000/images/albums/файл.svg` (через прокси Vite)

## Рекомендации

1. **Размер файлов**: Держите изображения небольшими (< 100KB для SVG, < 500KB для растровых)
2. **Именование**: Используйте понятные имена файлов (`исполнитель-альбом.svg`)
3. **Формат**: Предпочитайте SVG для лучшей масштабируемости
4. **Резервные копии**: Всегда имейте fallback изображения
