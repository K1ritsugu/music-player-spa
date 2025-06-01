const fs = require('fs')
const path = require('path')

module.exports = (req, res, next) => {
  // Обработка toggle favorite
  if (req.method === 'POST' && req.url.match(/\/api\/tracks\/favorites\/(.+)\/toggle/)) {
    const trackId = req.url.match(/\/api\/tracks\/favorites\/(.+)\/toggle/)[1]
    
    try {
      // Читаем текущую базу данных
      const dbPath = path.join(__dirname, 'db.json')
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      
      // Находим трек и переключаем isLiked
      const track = db.tracks.find(t => t.id === trackId)
      if (track) {
        track.isLiked = !track.isLiked
        
        // Сохраняем изменения
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
        
        res.status(200).json({ success: true, isLiked: track.isLiked })
        return
      } else {
        res.status(404).json({ error: 'Track not found' })
        return
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
      return
    }
  }
  
  // Обработка получения избранных треков
  if (req.method === 'GET' && req.url === '/api/tracks/favoriteTracks') {
    try {
      const dbPath = path.join(__dirname, 'db.json')
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      
      const favoriteTraks = db.tracks.filter(track => track.isLiked)
      res.status(200).json(favoriteTraks)
      return
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
      return
    }
  }
  
  next()
}
