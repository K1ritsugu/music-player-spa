const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Middleware для обработки favorites
server.use('/api/tracks/favorites', (req, res, next) => {
  if (req.method === 'GET') {
    const db = router.db
    const favorites = db.get('favorites').value()
    const tracks = db.get('tracks').value()
    
    // Находим любимые треки для пользователя user1
    const userFavorites = favorites.find(f => f.userId === 'user1')
    if (userFavorites) {
      const favoriteTracks = tracks.filter(track => userFavorites.trackIds.includes(track.id))
      return res.json(favoriteTracks)
    }
    
    return res.json([])
  }
  next()
})

// Middleware для получения рекомендаций
server.use('/api/tracks/recommendations', (req, res, next) => {
  if (req.method === 'GET') {
    const db = router.db
    const recommendations = db.get('recommendations').value()
    
    const userRecommendations = recommendations.find(r => r.userId === 'user1')
    if (userRecommendations) {
      return res.json(userRecommendations.tracks)
    }
    
    return res.json([])
  }
  next()
})

// Middleware для toggle favorite
server.use('/api/tracks/favorites/:id/toggle', (req, res, next) => {
  if (req.method === 'POST') {
    const trackId = req.params.id
    const db = router.db
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
})

// Переписываем /api routes
server.use(jsonServer.rewriter({
  '/api/tracks': '/tracks',
  '/api/tracks/:id': '/tracks/:id',
  '/api/playlists': '/playlists',
  '/api/playlists/:id': '/playlists/:id',
  '/api/users': '/users',
  '/api/users/:id': '/users/:id'
}))

server.use(middlewares)
server.use(router)

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001')
})
