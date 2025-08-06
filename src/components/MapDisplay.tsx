'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IUser } from '@/models/User'

// Small Rolling Sage Icon Component
const SmallRollingSageIcon = ({ className }: { className?: string }) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div className={`animate-spin rounded-full border-b-2 border-yellow-400 ${className}`}></div>
  }

  return (
    <img 
      src="https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png"
      alt="Sage"
      className={`inline-block object-contain ${className}`}
      style={{
        animation: 'spin 2s linear infinite',
        filter: 'brightness(0) invert(1)'
      }}
      onError={() => setHasError(true)}
    />
  )
}

// 地图数据接口
interface MapStats {
  wins: number
  games: number
  winRate: number
}

interface TeamMapData {
  bestTeamMap: string
  bestTeamWinRate: number
  teamMapStats: { [mapName: string]: { wins: number, games: number } }
}

interface UserMapData {
  user: IUser
  bestMap: string
  bestMapWinRate: number
  mapStats: { [mapName: string]: MapStats }
}

// Valorant 官方地图信息（用于显示图片）
const VALORANT_MAPS: { [key: string]: { displayName: string, splash: string } } = {
  'Ascent': {
    displayName: 'Ascent',
    splash: 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png'
  },
  'Bind': {
    displayName: 'Bind', 
    splash: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5caa/splash.png'
  },
  'Haven': {
    displayName: 'Haven',
    splash: 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png'
  },
  'Split': {
    displayName: 'Split',
    splash: 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png'
  },
  'Fracture': {
    displayName: 'Fracture',
    splash: 'https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png'
  },
  'Breeze': {
    displayName: 'Breeze',
    splash: 'https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png'
  },
  'Icebox': {
    displayName: 'Icebox',
    splash: 'https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png'
  },
  'Pearl': {
    displayName: 'Pearl',
    splash: 'https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png'
  },
  'Lotus': {
    displayName: 'Lotus',
    splash: 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png'
  },
  'Sunset': {
    displayName: 'Sunset',
    splash: 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png'
  }
}

interface MapDisplayProps {
  users: IUser[]
}

export default function MapDisplay({ users }: MapDisplayProps) {
  const [teamMapData, setTeamMapData] = useState<TeamMapData | null>(null)
  const [userMapData, setUserMapData] = useState<UserMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取地图统计数据
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)
        
        // 获取团队地图数据
        const teamResponse = await fetch('/api/maps/team')
        const userResponse = await fetch('/api/maps/users')
        
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamMapData(teamData)
        }
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserMapData(userData)
        }
        
      } catch (error) {
        console.error('Error fetching map data:', error)
        setError('地图数据加载失败')
      } finally {
        setLoading(false)
      }
    }

    if (users.length > 0) {
      fetchMapData()
    }
  }, [users])

  // 获取地图图片
  const getMapImage = (mapName: string) => {
    return VALORANT_MAPS[mapName]?.splash || 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <SmallRollingSageIcon className="h-8 w-8 mx-auto" />
        <p className="text-gray-400 mt-2">正在加载地图数据...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 团队最强地图 */}
      {teamMapData && teamMapData.bestTeamMap && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-green-400/50 valorant-teal-glow">
            <CardHeader className="py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                🏆 团队最强地图 (近一个月)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* 地图图片 */}
                <div className="relative overflow-hidden rounded-lg group">
                  <img
                    src={getMapImage(teamMapData.bestTeamMap)}
                    alt={teamMapData.bestTeamMap}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-2xl font-bold text-white">{teamMapData.bestTeamMap}</h3>
                  </div>
                </div>
                
                {/* 统计数据 */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-green-400">
                      {teamMapData.bestTeamWinRate.toFixed(1)}%
                    </div>
                    <div className="text-gray-400">团队胜率</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-white">
                        {teamMapData.teamMapStats[teamMapData.bestTeamMap]?.wins || 0}
                      </div>
                      <div className="text-sm text-gray-400">胜场</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {teamMapData.teamMapStats[teamMapData.bestTeamMap]?.games || 0}
                      </div>
                      <div className="text-sm text-gray-400">总场数</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 text-center">
                    这是团队在过去一个月表现最好的地图
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 个人最强地图 */}
      {userMapData.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-blue-400/50 glow">
            <CardHeader className="py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⭐ 个人最强地图 (近一个月)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userMapData.map((userData, index) => (
                  <motion.div
                    key={userData.user._id?.toString()}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5 + index * 0.1,
                      type: "spring",
                      bounce: 0.3
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl hover:from-slate-700/80 hover:to-slate-600/80 transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40">
                      <CardContent className="p-3">
                        {/* 地图图片 */}
                        <div className="relative overflow-hidden rounded-md mb-3">
                          <img
                            src={getMapImage(userData.bestMap)}
                            alt={userData.bestMap}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {userData.bestMapWinRate.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* 用户信息 */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={`/photos/${userData.user.photoPath}`}
                              alt={userData.user.realName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-bold text-white text-sm truncate">
                              {userData.user.realName}
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-bold text-blue-400">
                              {userData.bestMap || '暂无数据'}
                            </div>
                            {userData.mapStats[userData.bestMap] && (
                              <div className="text-xs text-gray-400">
                                {userData.mapStats[userData.bestMap].wins}胜 / {userData.mapStats[userData.bestMap].games}场
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}