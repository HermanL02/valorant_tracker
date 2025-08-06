import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import TeamMapStats from '@/models/TeamMapStats'
import ValorantAPI from '@/lib/valorantApi'

export async function POST() {
  try {
    await dbConnect()
    
    // Get the user with the oldest lastUpdated date (or never updated)
    const user = await User.findOne({}).sort({ lastUpdated: 1 })
    
    if (!user) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 })
    }

    const valorantAPI = new ValorantAPI()
    
    // Parse username and tag from RiotUserName
    const [username, tag] = user.riotUserName.split('#')
    
    if (!username || !tag) {
      console.error('Invalid username format:', user.riotUserName)
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
    }

    try {
      // Fetch MMR data
      const mmrData = await valorantAPI.getMMR(username, tag)
      
      // Fetch season stats
      const seasonStats = await valorantAPI.getSeasonStats(username, tag)
      
      // Fetch map stats
      const mapStats = await valorantAPI.getMapStats(username, tag)
      
      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          rank: mmrData.data?.currenttierpatched || 'Unranked',
          rankTier: mmrData.data?.currenttier || 0,
          mmr: mmrData.data?.elo || mmrData.data?.ranking_in_tier || 0,
          kd: seasonStats.kd || 0,
          matchesPlayed: seasonStats.matchesPlayed || 0,
          kills: seasonStats.kills || 0,
          deaths: seasonStats.deaths || 0,
          assists: seasonStats.assists || 0,
          firstBloods: seasonStats.firstBloods || 0,
          // 添加地图数据
          mapStats: mapStats.mapStats || {},
          bestMap: mapStats.bestMap || null,
          bestMapWinRate: mapStats.bestMapWinRate || 0,
          lastUpdated: new Date(),
        },
        { new: true }
      )
      
      // Check if we should update team map stats (every 10th user update or if never updated)
      const userCount = await User.countDocuments({})
      const userIndex = await User.countDocuments({ lastUpdated: { $lt: updatedUser.lastUpdated } })
      
      // Update team map stats every 10th user or if team stats don't exist
      const teamMapStats = await TeamMapStats.findOne({})
      const shouldUpdateTeamStats = (userIndex % 10 === 0) || !teamMapStats
      
      if (shouldUpdateTeamStats) {
        try {
          const allUsers = await User.find({})
          const teamMapData = await valorantAPI.getTeamMapStats(allUsers)
          
          if (!teamMapData.error) {
            await TeamMapStats.findOneAndUpdate(
              {},
              {
                bestTeamMap: teamMapData.bestTeamMap,
                bestTeamWinRate: teamMapData.bestTeamWinRate,
                teamMapStats: teamMapData.teamMapStats,
                lastUpdated: new Date()
              },
              { upsert: true, new: true }
            )
          }
        } catch (teamError) {
          console.error('Error updating team map stats:', teamError)
          // Don't fail the entire cron job for team stats errors
        }
      }
      
      return NextResponse.json({ 
        message: 'User updated successfully', 
        user: updatedUser,
        updated: user.realName,
        teamStatsUpdated: shouldUpdateTeamStats
      })
      
    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
      console.error('API Error for user', user.realName, ':', errorMessage)
      
      // Still update lastUpdated even if API fails to avoid getting stuck
      await User.findByIdAndUpdate(user._id, { lastUpdated: new Date() })
      
      return NextResponse.json({ 
        error: `API failed for ${user.realName}: ${errorMessage}`,
        user: user.realName 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}