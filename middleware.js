module.exports = (req, res, next) => {
  // Middleware для обработки favorites
  if (req.path === '/tracks/favorites' && req.method === 'GET') {
    const db = req.app.db
    const favorites = db.get('favorites').value()
    const tracks = db.get('tracks').value()
    
    // Находим любимые треки для пользователя user1 (можно расширить для аутентификации)
    const userFavorites = favorites.find(f => f.userId === 'user1')
    if (userFavorites) {
      const favoriteTracks = tracks.filter(track => userFavorites.trackIds.includes(track.id))
      return res.json(favoriteTracks)
    }
    
    return res.json([])
  }

  // Middleware для получения рекомендаций
  if (req.path === '/tracks/recommendations' && req.method === 'GET') {
    const db = req.app.db
    const recommendations = db.get('recommendations').value()
    
    const userRecommendations = recommendations.find(r => r.userId === 'user1')
    if (userRecommendations) {
      return res.json(userRecommendations.tracks)
    }
    
    return res.json([])
  }

  // Middleware для toggle favorite
  if (req.path.match(/\/tracks\/favorites\/(.+)\/toggle/) && req.method === 'POST') {
    const trackId = req.params[0]
    const db = req.app.db
    const favorites = db.get('favorites')
    
    const userFavorites = favorites.find({ userId: 'user1' }).value()
    if (userFavorites) {
      const trackIndex = userFavorites.trackIds.indexOf(trackId)
      if (trackIndex > -1) {
        // Удаляем из избранного
        userFavorites.trackIds.splice(trackIndex, 1)
      } else {
        // Добавляем в избранное
        userFavorites.trackIds.push(trackId)
      }
      
      favorites.find({ userId: 'user1' }).assign({ trackIds: userFavorites.trackIds }).write()
    }
    
    return res.json({ success: true })
  }

  next()
}
