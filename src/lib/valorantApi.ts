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
}

export default ValorantAPI