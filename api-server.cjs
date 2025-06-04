const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
// Используем Formidable v2+
const { formidable } = require('formidable');

const PORT = 3002;

function loadDatabase() {
  try {
    const dbPath = path.join(__dirname, 'db.json');
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    return { tracks: [], playlists: [], users: [] };
  }
}

function saveDatabase(db) {
  try {
    const dbPath = path.join(__dirname, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
}

// Функция для сохранения файла в public папку (учитывает случаи, когда file — массив)
function saveFileToPublic(file, subDir = '') {
  try {
    // Если file — массив, берем первый элемент
    if (Array.isArray(file)) {
      file = file[0];
    }

    const publicDir = path.join(__dirname, 'public', subDir);

    // Создаем папку, если её нет
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // В зависимости от версии formidable, tempPath может быть в file.filepath или file.path
    const tempPath = file.filepath || file.path;
    // В зависимости от версии formidable, имя можно получить из file.originalFilename или file.newFilename или file.name
    const originalName = file.originalFilename || file.newFilename || file.name;
    if (!tempPath || !originalName) {
      console.error('Error: отсутствуют свойства filepath или originalFilename у файла', file);
      return null;
    }

    const fileName = `${Date.now()}_${originalName}`;
    const filePath = path.join(publicDir, fileName);

    // Копируем файл из временной директории в public
    fs.copyFileSync(tempPath, filePath);

    // Возвращаем публичный URL (например, "/avatars/12345_filename.png")
    return `/${subDir}${subDir ? '/' : ''}${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}


function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // POST /api/upload/audio - загрузка аудио файла
  if (req.method === 'POST' && pathname === '/api/upload/audio') {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowEmptyFiles: false,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        sendJSON(res, 400, { error: 'Ошибка загрузки файла' });
        return;
      }

      const audioFile = files.audio;
      if (!audioFile) {
        sendJSON(res, 400, { error: 'Аудио файл не найден' });
        return;
      }

      const savedPath = saveFileToPublic(audioFile, 'audio');
      if (savedPath) {
        sendJSON(res, 200, { url: savedPath });
      } else {
        sendJSON(res, 500, { error: 'Не удалось сохранить файл' });
      }
    });
    return;
  }

  // POST /api/upload/image - загрузка изображения
  if (req.method === 'POST' && pathname === '/api/upload/image') {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        sendJSON(res, 400, { error: 'Ошибка загрузки файла' });
        return;
      }

      const imageFile = files.image;
      if (!imageFile) {
        sendJSON(res, 400, { error: 'Изображение не найдено' });
        return;
      }

      const savedPath = saveFileToPublic(imageFile, 'images');
      if (savedPath) {
        sendJSON(res, 200, { url: savedPath });
      } else {
        sendJSON(res, 500, { error: 'Не удалось сохранить файл' });
      }
    });
    return;
  }

  // POST /api/upload/avatar - загрузка аватара
  if (req.method === 'POST' && pathname === '/api/upload/avatar') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJSON(res, 401, { error: 'Необходима авторизация' });
      return;
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        sendJSON(res, 400, { error: 'Ошибка загрузки файла' });
        return;
      }

      const avatarFile = files.avatar;
      if (!avatarFile) {
        sendJSON(res, 400, { error: 'Аватар не найден' });
        return;
      }

      const savedPath = saveFileToPublic(avatarFile, 'avatars');
      if (savedPath) {
        sendJSON(res, 200, { url: savedPath });
      } else {
        sendJSON(res, 500, { error: 'Не удалось сохранить файл' });
      }
    });
    return;
  }

  // AUTH ENDPOINTS

  // POST /api/auth/register - регистрация пользователя
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const db = loadDatabase();

        if (!db.users) db.users = [];

        // Проверяем, есть ли уже пользователь с таким email
        const existingUser = db.users.find(user => user.email === userData.email);
        if (existingUser) {
          sendJSON(res, 400, { error: 'Пользователь с таким email уже существует' });
          return;
        }
        const newUser = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name || 'Новый пользователь',
          role: 'listener',
          avatarUrl: null,
          createdAt: new Date().toISOString()
        };

        db.users.push(newUser);

        if (saveDatabase(db)) {
          const mockToken = `mock-token-${newUser.id}`;
          sendJSON(res, 201, {
            user: newUser,
            token: mockToken
          });
        } else {
          sendJSON(res, 500, { error: 'Не удалось сохранить пользователя' });
        }
      } catch (error) {
        sendJSON(res, 400, { error: 'Неверный JSON' });
      }
    });
    return;
  }

  // POST /api/auth/login - вход пользователя
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { email } = JSON.parse(body);
        const db = loadDatabase();

        if (!db.users) db.users = [];

        // Находим пользователя по email (пароль игнорируем - это мок)
        let user = db.users.find(user => user.email === email);

        // Если пользователя нет, создаем его автоматически
        if (!user) {
          user = {
            id: Date.now().toString(),
            email: email,
            name: 'Новый пользователь',
            role: 'listener',
            avatarUrl: null,
            createdAt: new Date().toISOString()
          };
          db.users.push(user);
          saveDatabase(db);
        }

        const mockToken = `mock-token-${user.id}`;
        sendJSON(res, 200, {
          user: user,
          token: mockToken
        });
      } catch (error) {
        sendJSON(res, 400, { error: 'Неверный JSON' });
      }
    });
    return;
  }

  // GET /api/auth/profile - получить профиль пользователя
  if (req.method === 'GET' && pathname === '/api/auth/profile') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJSON(res, 401, { error: 'Необходима авторизация' });
      return;
    }

    const token = authHeader.substring(7);
    const userId = token.replace('mock-token-', '');

    const db = loadDatabase();
    const user = (db.users || []).find(u => u.id === userId);

    if (user) {
      sendJSON(res, 200, user);
    } else {
      sendJSON(res, 404, { error: 'Пользователь не найден' });
    }
    return;
  }

  // PUT /api/auth/profile - обновить профиль пользователя
  if (req.method === 'PUT' && pathname === '/api/auth/profile') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJSON(res, 401, { error: 'Необходима авторизация' });
      return;
    }

    const token = authHeader.substring(7);
    const userId = token.replace('mock-token-', '');

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        const db = loadDatabase();

        const userIndex = (db.users || []).findIndex(u => u.id === userId);
        if (userIndex === -1) {
          sendJSON(res, 404, { error: 'Пользователь не найден' });
          return;
        }

        const user = db.users[userIndex];

        // Обновляем только разрешенные поля
        if (updateData.name !== undefined) {
          user.name = updateData.name;
        }
        if (updateData.avatarUrl !== undefined) {
          user.avatarUrl = updateData.avatarUrl;
        }

        user.updatedAt = new Date().toISOString();

        if (saveDatabase(db)) {
          sendJSON(res, 200, user);
        } else {
          sendJSON(res, 500, { error: 'Не удалось сохранить изменения' });
        }
      } catch (error) {
        sendJSON(res, 400, { error: 'Неверный JSON' });
      }
    });
    return;
  }

  // TRACKS ENDPOINTS

  // GET /api/tracks - получить все треки (публичные + пользовательские)
  if (req.method === 'GET' && pathname === '/api/tracks') {
    const db = loadDatabase();
    const { search, genre, userId } = parsedUrl.query;
    let tracks = db.tracks || [];

    // Получаем текущего пользователя из токена
    const authHeader = req.headers.authorization;
    let currentUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      currentUserId = token.replace('mock-token-', '');
    }

    if (search) {
      tracks = tracks.filter(
        track =>
          track.title.toLowerCase().includes(search.toLowerCase()) ||
          track.artist.toLowerCase().includes(search.toLowerCase()) ||
          track.album.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (genre) {
      tracks = tracks.filter(track => track.genre === genre);
    }

    sendJSON(res, 200, tracks);
    return;
  }

  // GET /api/tracks/my - получить треки текущего пользователя
  if (req.method === 'GET' && pathname === '/api/tracks/my') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJSON(res, 401, { error: 'Необходима авторизация' });
      return;
    }

    const token = authHeader.substring(7);
    const userId = token.replace('mock-token-', '');

    const db = loadDatabase();
    const myTracks = (db.tracks || []).filter(track => track.createdBy === userId);

    sendJSON(res, 200, myTracks);
    return;
  }

  // GET /api/tracks/favoriteTracks - получить избранные треки
  if (req.method === 'GET' && pathname === '/api/tracks/favoriteTracks') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJSON(res, 401, { error: 'Необходима авторизация' });
      return;
    }

    const token = authHeader.substring(7);
    const userId = token.replace('mock-token-', '');

    const db = loadDatabase();
    const favoriteTracks = (db.tracks || []).filter(track => track.isLiked).filter(track => track.createdBy === userId);
    sendJSON(res, 200, favoriteTracks);
    return;
  }

  // POST /api/tracks - создать новый трек
  if (req.method === 'POST' && pathname === '/api/tracks') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const trackData = JSON.parse(body);
        const db = loadDatabase();

        // Получаем пользователя из токена
        const authHeader = req.headers.authorization;
        let createdBy = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          createdBy = token.replace('mock-token-', '');
        }

        const newTrack = {
          id: Date.now().toString(),
          title: trackData.title || 'Untitled',
          artist: trackData.artist || 'Unknown Artist',
          album: trackData.album || 'Unknown Album',
          duration: trackData.duration || 0,
          url: trackData.url || '',
          coverUrl: trackData.coverUrl || '/placeholder.jpg',
          genre: trackData.genre || 'Unknown',
          releaseDate: trackData.releaseDate || new Date().toISOString().split('T')[0],
          playCount: 0,
          isLiked: false,
          createdBy: createdBy, // Связываем трек с пользователем
          createdAt: new Date().toISOString()
        };

        if (!db.tracks) db.tracks = [];
        db.tracks.push(newTrack);

        if (saveDatabase(db)) {
          sendJSON(res, 201, newTrack);
        } else {
          sendJSON(res, 500, { error: 'Failed to save track' });
        }
      } catch (error) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // POST /api/tracks/favorites/:id/toggle - переключить избранное
  const toggleMatch = pathname.match(/^\/api\/tracks\/favorites\/(.+)\/toggle$/);
  if (req.method === 'POST' && toggleMatch) {
    const trackId = toggleMatch[1];
    const db = loadDatabase();

    const track = (db.tracks || []).find(t => t.id === trackId);
    if (track) {
      track.isLiked = !track.isLiked;

      if (saveDatabase(db)) {
        sendJSON(res, 200, { success: true, isLiked: track.isLiked });
      } else {
        sendJSON(res, 500, { error: 'Failed to save changes' });
      }
    } else {
      sendJSON(res, 404, { error: 'Track not found' });
    }
    return;
  }
  // GET /api/playlists - получить все плейлисты
  if (req.method === 'GET' && pathname === '/api/playlists') {
    const authHeader = req.headers.authorization;
    let currentUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      currentUserId = token.replace('mock-token-', '');
    }

    const db = loadDatabase();
    // Показываем только плейлисты текущего пользователя
    let playlists = (db.playlists || []);
    if (currentUserId) {
      playlists = playlists.filter(playlist => playlist.createdBy === currentUserId);
    } else {
      // Если пользователь не авторизован, не показываем плейлисты
      playlists = [];
    }

    sendJSON(res, 200, playlists);
    return;
  }

  // GET /api/playlists/:id - получить плейлист по ID
  const playlistMatch = pathname.match(/^\/api\/playlists\/(.+)$/);
  if (req.method === 'GET' && playlistMatch) {
    const playlistId = playlistMatch[1];
    const db = loadDatabase();
    const playlist = (db.playlists || []).find(p => p.id === playlistId);

    if (playlist) {
      sendJSON(res, 200, playlist);
    } else {
      sendJSON(res, 404, { error: 'Playlist not found' });
    }
    return;
  }

  // POST /api/playlists - создать новый плейлист
  if (req.method === 'POST' && pathname === '/api/playlists') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {      try {
        const playlistData = JSON.parse(body);
        const db = loadDatabase();

        // Получаем пользователя из токена
        const authHeader = req.headers.authorization;
        let createdBy = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          createdBy = token.replace('mock-token-', '');
        }

        const newPlaylist = {
          id: Date.now().toString(),
          name: playlistData.name || 'Новый плейлист',
          description: playlistData.description || '',
          coverUrl: playlistData.coverUrl || '/placeholder.jpg',
          tracks: [],
          trackIds: playlistData.trackIds || [],
          createdBy: createdBy, // Связываем плейлист с пользователем
          isPublic: playlistData.isPublic !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Добавляем треки в плейлист, если указаны trackIds
        if (playlistData.trackIds && playlistData.trackIds.length > 0) {
          newPlaylist.tracks = (db.tracks || []).filter(track =>
            playlistData.trackIds.includes(track.id)
          );
        }

        if (!db.playlists) db.playlists = [];
        db.playlists.push(newPlaylist);

        if (saveDatabase(db)) {
          sendJSON(res, 201, newPlaylist);
        } else {
          sendJSON(res, 500, { error: 'Failed to save playlist' });
        }
      } catch (error) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // DELETE /api/playlists/:id - удалить плейлист
  const deletePlaylistMatch = pathname.match(/^\/api\/playlists\/(.+)$/);
  if (req.method === 'DELETE' && deletePlaylistMatch) {
    const playlistId = deletePlaylistMatch[1];
    const db = loadDatabase();

    const playlistIndex = (db.playlists || []).findIndex(p => p.id === playlistId);
    if (playlistIndex !== -1) {
      db.playlists.splice(playlistIndex, 1);

      if (saveDatabase(db)) {
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 500, { error: 'Failed to save changes' });
      }
    } else {
      sendJSON(res, 404, { error: 'Playlist not found' });
    }
    return;
  }

  // POST /api/playlists/:id/tracks - добавить трек в плейлист
  const addTrackMatch = pathname.match(/^\/api\/playlists\/(.+)\/tracks$/);
  if (req.method === 'POST' && addTrackMatch) {
    const playlistId = addTrackMatch[1];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { trackId } = JSON.parse(body);
        const db = loadDatabase();

        const playlist = (db.playlists || []).find(p => p.id === playlistId);
        const track = (db.tracks || []).find(t => t.id === trackId);

        if (!playlist) {
          sendJSON(res, 404, { error: 'Playlist not found' });
          return;
        }

        if (!track) {
          sendJSON(res, 404, { error: 'Track not found' });
          return;
        }

        // Проверяем, нет ли уже такого трека в плейлисте
        const trackExists =
          playlist.tracks.some(t => t.id === trackId) ||
          playlist.trackIds.includes(trackId);

        if (trackExists) {
          sendJSON(res, 400, { error: 'Track already exists in playlist' });
          return;
        }

        // Добавляем трек
        playlist.tracks.push(track);
        if (!playlist.trackIds.includes(trackId)) {
          playlist.trackIds.push(trackId);
        }
        playlist.updatedAt = new Date().toISOString();

        if (saveDatabase(db)) {
          sendJSON(res, 200, { success: true });
        } else {
          sendJSON(res, 500, { error: 'Failed to save changes' });
        }
      } catch (error) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // GET /api/tracks/:id - получить трек по ID
  const trackMatch = pathname.match(/^\/api\/tracks\/(.+)$/);
  if (req.method === 'GET' && trackMatch) {
    const trackId = trackMatch[1];
    const db = loadDatabase();
    const track = (db.tracks || []).find(t => t.id === trackId);

    if (track) {
      sendJSON(res, 200, track);
    } else {
      sendJSON(res, 404, { error: 'Track not found' });
    }
    return;
  }

  // DELETE /api/tracks/:id - удалить трек
  const deleteTrackMatch = pathname.match(/^\/api\/tracks\/(.+)$/);
  if (req.method === 'DELETE' && deleteTrackMatch) {
    const trackId = deleteTrackMatch[1];
    const db = loadDatabase();

    // Получаем пользователя из токена для проверки прав
    const authHeader = req.headers.authorization;
    let currentUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      currentUserId = token.replace('mock-token-', '');
    }

    const trackIndex = (db.tracks || []).findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      sendJSON(res, 404, { error: 'Track not found' });
      return;
    }

    const track = db.tracks[trackIndex];

    // Проверяем права - только создатель трека может его удалить
    if (track.createdBy && track.createdBy !== currentUserId) {
      sendJSON(res, 403, { error: 'You can only delete your own tracks' });
      return;
    }

    // Удаляем трек
    db.tracks.splice(trackIndex, 1);

    // Удаляем трек из всех плейлистов
    if (db.playlists) {
      db.playlists.forEach(playlist => {
        // Удаляем из массива tracks
        playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
        // Удаляем из массива trackIds
        playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
        playlist.updatedAt = new Date().toISOString();
      });
    }

    // Удаляем из избранного
    if (db.favorites) {
      db.favorites.forEach(favorite => {
        favorite.trackIds = favorite.trackIds.filter(id => id !== trackId);
      });
    }

    if (saveDatabase(db)) {
      sendJSON(res, 200, { success: true });
    } else {
      sendJSON(res, 500, { error: 'Failed to save changes' });
    }
    return;
  }

  // 404
  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`API Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/upload/audio');
  console.log('  POST   /api/upload/image');
  console.log('  POST   /api/upload/avatar');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/profile');
  console.log('  PUT    /api/auth/profile');
  console.log('  GET    /api/tracks');
  console.log('  GET    /api/tracks/my');
  console.log('  POST   /api/tracks');
  console.log('  GET    /api/tracks/favoriteTracks');
  console.log('  GET    /api/tracks/:id');
  console.log('  DELETE /api/tracks/:id');
  console.log('  POST   /api/tracks/favorites/:id/toggle');
  console.log('  GET    /api/playlists');
  console.log('  GET    /api/playlists/:id');
  console.log('  POST   /api/playlists');
  console.log('  DELETE /api/playlists/:id');
});
