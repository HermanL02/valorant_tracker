import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import TeamMapStats from '@/models/TeamMapStats'

export async function GET() {
  try {
    await dbConnect()
    
    // 从数据库获取团队地图统计
    const teamMapData = await TeamMapStats.findOne({}).sort({ lastUpdated: -1 })
    
    if (!teamMapData) {
      return NextResponse.json({ 
        error: 'No team map data available. Please wait for the next cron job update.' 
      }, { status: 404 })
    }

    return NextResponse.json({
      bestTeamMap: teamMapData.bestTeamMap,
      bestTeamWinRate: teamMapData.bestTeamWinRate,
      teamMapStats: teamMapData.teamMapStats,
      lastUpdated: teamMapData.lastUpdated
    })

  } catch (error) {
    console.error('Error fetching team map data:', error)
    return NextResponse.json({ error: 'Failed to fetch team map data' }, { status: 500 })
  }
}