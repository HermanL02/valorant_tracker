import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await dbConnect()
    
    // 从数据库获取所有用户及其地图数据
    const users = await User.find({}).select({
      _id: 1,
      realName: 1,
      photoPath: 1,
      riotUserName: 1,
      mapStats: 1,
      bestMap: 1,
      bestMapWinRate: 1,
      lastUpdated: 1
    })
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 })
    }

    const userMapData = users.map(user => ({
      user: {
        _id: user._id,
        realName: user.realName,
        photoPath: user.photoPath,
        riotUserName: user.riotUserName
      },
      bestMap: user.bestMap || '暂无数据',
      bestMapWinRate: user.bestMapWinRate || 0,
      mapStats: user.mapStats || {},
      lastUpdated: user.lastUpdated
    }))

    return NextResponse.json(userMapData)

  } catch (error) {
    console.error('Error fetching user map data:', error)
    return NextResponse.json({ error: 'Failed to fetch user map data' }, { status: 500 })
  }
}