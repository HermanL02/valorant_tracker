class ValorantAPI {
  private apiKey: string
  private baseUrl: string = 'https://api.henrikdev.xyz/valorant/v1'

  constructor() {
    this.apiKey = process.env.VALORANT_API!
  }

  async makeRequest(endpoint: string) {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getAccount(name: string, tag: string) {
    const encodedName = encodeURIComponent(name)
    const encodedTag = encodeURIComponent(tag)
    return await this.makeRequest(`/account/${encodedName}/${encodedTag}`)
  }

  async getMMR(name: string, tag: string, region: string = 'na') {
    const encodedName = encodeURIComponent(name)
    const encodedTag = encodeURIComponent(tag)
    return await this.makeRequest(`/mmr/${region}/${encodedName}/${encodedTag}`)
  }

  async getSeasonStats(name: string, tag: string, region: string = 'na') {
    const matches = await this.getStoredMatches(name, tag, region, null, null, 50)
    
    if (!matches.data || matches.data.length === 0) {
      return { error: 'No matches found' }
    }

    // Get current season
    const currentSeason = matches.data[0]?.meta?.season?.id
    const seasonMatches = matches.data.filter((match: Record<string, any>) => {
      return match.meta.season?.id === currentSeason
    })

    let totalKills = 0, totalDeaths = 0, totalAssists = 0, firstBloods = 0

    seasonMatches.forEach((match: Record<string, any>) => {
      if (match.stats) {
        totalKills += match.stats.kills || 0
        totalDeaths += match.stats.deaths || 0
        totalAssists += match.stats.assists || 0
        
        if (match.stats.first_bloods) {
          firstBloods += match.stats.first_bloods
        }
      }
    })

    return {
      matchesPlayed: seasonMatches.length,
      kd: totalDeaths > 0 ? +(totalKills / totalDeaths).toFixed(2) : totalKills,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      firstBloods: firstBloods,
    }
  }

  private async getStoredMatches(name: string, tag: string, region: string = 'na', mode: string | null = null, map: string | null = null, size: number = 20) {
    const encodedName = encodeURIComponent(name)
    const encodedTag = encodeURIComponent(tag)
    let endpoint = `/stored-matches/${region}/${encodedName}/${encodedTag}?size=${size}`
    
    if (mode) endpoint += `&mode=${mode}`
    if (map) endpoint += `&map=${map}`
    
    return await this.makeRequest(endpoint)
  }

  // 获取用户的地图统计数据（近一个月）
  async getMapStats(name: string, tag: string, region: string = 'na') {
    try {
      const matches = await this.getStoredMatches(name, tag, region, null, null, 200) // 获取更多比赛数据以覆盖一个月
      
      if (!matches.data || matches.data.length === 0) {
        return { error: 'No matches found' }
      }

      // 过滤近一个月的比赛（30天内）
      const oneMonthAgo = new Date()
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
      
      const recentMatches = matches.data.filter((match: any) => {
        const matchDate = new Date(match.meta.started_at)
        return matchDate >= oneMonthAgo
      })

      // 按地图统计胜负
      const mapStats: { [mapName: string]: { wins: number, games: number, kills: number, deaths: number } } = {}
      
      recentMatches.forEach((match: any) => {
        const mapName = match.meta.map.name
        const playerStats = match.stats
        const hasWon = match.stats?.team === 'Red' ? match.teams.red > match.teams.blue : match.teams.blue > match.teams.red
        
        if (!mapStats[mapName]) {
          mapStats[mapName] = { wins: 0, games: 0, kills: 0, deaths: 0 }
        }
        
        mapStats[mapName].games++
        if (hasWon) {
          mapStats[mapName].wins++
        }
        
        if (playerStats) {
          mapStats[mapName].kills += playerStats.kills || 0
          mapStats[mapName].deaths += playerStats.deaths || 0
        }
      })

      // 计算胜率并找出最强地图
      let bestMap = ''
      let bestWinRate = 0
      
      Object.keys(mapStats).forEach(mapName => {
        const stats = mapStats[mapName]
        const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
        
        if (winRate > bestWinRate && stats.games >= 3) { // 至少3场比赛
          bestWinRate = winRate
          bestMap = mapName
        }
      })

      // 格式化返回数据
      const formattedMapStats: { [mapName: string]: { wins: number, games: number, winRate: number } } = {}
      Object.keys(mapStats).forEach(mapName => {
        const stats = mapStats[mapName]
        formattedMapStats[mapName] = {
          wins: stats.wins,
          games: stats.games,
          winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
        }
      })

      return {
        mapStats: formattedMapStats,
        bestMap,
        bestMapWinRate: bestWinRate,
        totalGames: recentMatches.length
      }
    } catch (error) {
      console.error('Failed to get map stats:', error)
      return { error: 'Failed to fetch map stats' }
    }
  }

  // 获取团队的地图统计数据
  async getTeamMapStats(users: Array<{riotUserName: string}>, region: string = 'na') {
    try {
      const allMapStats: { [mapName: string]: { wins: number, games: number } } = {}
      
      // 为每个用户获取地图数据
      for (const user of users) {
        const [name, tag] = user.riotUserName.split('#')
        if (!name || !tag) continue
        
        const userMapStats = await this.getMapStats(name, tag, region)
        
        if (!userMapStats.error && userMapStats.mapStats) {
          // 合并用户的地图统计到团队统计中
          Object.keys(userMapStats.mapStats).forEach(mapName => {
            const stats = userMapStats.mapStats![mapName]
            if (!allMapStats[mapName]) {
              allMapStats[mapName] = { wins: 0, games: 0 }
            }
            
            allMapStats[mapName].wins += stats.wins
            allMapStats[mapName].games += stats.games
          })
        }
      }

      // 找出团队最强地图
      let bestTeamMap = ''
      let bestTeamWinRate = 0
      
      Object.keys(allMapStats).forEach(mapName => {
        const stats = allMapStats[mapName]
        const winRate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
        
        if (winRate > bestTeamWinRate && stats.games >= 10) { // 团队至少10场比赛
          bestTeamWinRate = winRate
          bestTeamMap = mapName
        }
      })

      return {
        teamMapStats: allMapStats,
        bestTeamMap,
        bestTeamWinRate
      }
    } catch (error) {
      console.error('Failed to get team map stats:', error)
      return { error: 'Failed to fetch team map stats' }
    }
  }
}

export default ValorantAPI