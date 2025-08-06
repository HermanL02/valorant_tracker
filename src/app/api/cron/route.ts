import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
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
          lastUpdated: new Date(),
        },
        { new: true }
      )
      
      return NextResponse.json({ 
        message: 'User updated successfully', 
        user: updatedUser,
        updated: user.realName 
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