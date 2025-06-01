# Music Player SPA

Современный SPA музыкальный плеер с функцией создания плейлистов, построенный на React 18+ и TypeScript.

## 🚀 Технологический стек

- **Frontend Framework**: React 18+ с TypeScript 5+
- **Build Tool**: Vite
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material UI (MUI) v5
- **Forms**: React Hook Form 7+ + Yup валидация
- **Charts**: Recharts 2+
- **Routing**: React Router 7+
- **Code Quality**: ESLint + Prettier (Airbnb config)
- **Architecture**: Feature-Sliced Design (FSD)

## 📁 Структура проекта (FSD)

```
src/
├── app/                    # Конфигурация приложения
│   ├── router/            # Роутинг
│   └── store/             # Store конфигурация
├── pages/                 # Страницы приложения
│   ├── dashboard/         # Главная страница
│   ├── login/             # Авторизация
│   ├── search/            # Поиск
│   ├── playlists/         # Плейлисты
│   └── profile/           # Профиль
├── widgets/               # Виджеты
│   ├── player/            # Музыкальный плеер
│   └── sidebar/           # Боковая панель
├── features/              # Фичи
│   ├── auth/              # Аутентификация
│   ├── player/            # Управление плеером
│   └── theme/             # Управление темой
├── entities/              # Бизнес-сущности
│   ├── track/             # Треки
│   ├── playlist/          # Плейлисты
│   └── user/              # Пользователи
└── shared/                # Общие компоненты
    ├── components/        # UI компоненты
    ├── hooks/             # Кастомные хуки
    ├── store/             # Store утилиты
    ├── theme/             # Тема MUI
    └── types/             # TypeScript типы
```

## 🎵 Основной функционал

### Система аутентификации
- **Роли**: слушатель, исполнитель, администратор
- **JWT авторизация** с автоматическим обновлением токенов
- **Личный кабинет** с настройками профиля

### Дашборды по ролям
  - Любимые треки и рекомендации
  - Управление плейлистами
  - Поиск по трекам с фильтрацией
  - Полнофункциональный плеер


### Музыкальный плеер
- **Полный контроль**: play/pause, next/previous, repeat, shuffle
- **Управление громкостью** и прогрессом трека
- **Очередь воспроизведения** с возможностью перестановки
- **Информация о треке**: обложка, название, исполнитель, время

### Взаимодействие с треками
- Добавление в избранное
- Создание и управление плейлистами
- Добавление в очередь воспроизведения
- Переход к альбому трека

## 🎨 UI/UX особенности

- **Минималистичный дизайн** в стиле Spotify
- **Темная/светлая тема** с переключением
- **Responsive design** для всех устройств
- **Skeleton loading** для асинхронных данных
- **Плавные анимации** и переходы
- **Accessibility (a11y)** поддержка

## 🛠 Установка и запуск

```bash
# Клонирование репозитория
git clone <repository-url>
cd music-player-spa

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev:full

# Сборка для продакшена
npm run build

# Предварительный просмотр сборки
npm run preview

# Линтинг кода
npm run lint
```


## 📊 Архитектурные решения

### State Management
- **Redux Toolkit** для глобального состояния
- **RTK Query** для кэширования API запросов
- **Локальное состояние** для UI компонентов

### Типизация
- **Строгая типизация** всех сущностей
- **Shared types** для переиспользования
- **API типы** автогенерируемые из схемы

### Производительность
- **React.memo** для предотвращения лишних рендеров
- **useCallback/useMemo** для оптимизации
- **Lazy loading** компонентов и роутов
- **Code splitting** по фичам

### Error Handling
- **Error Boundaries** для отлова ошибок
- **Graceful degradation** при сбоях API
- **User-friendly** сообщения об ошибках

## 🤝 Contributing

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request
