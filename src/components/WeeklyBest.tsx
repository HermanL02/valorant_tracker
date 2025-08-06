'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IUser } from '@/models/User'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Sword, Target, Crown, Star, Zap } from 'lucide-react'
import MapDisplay from './MapDisplay'

// Valorant-style custom icons component with fallback
const ValorantIcon = ({ type, className, colored = false }: { type: 'vandal' | 'phantom' | 'spike' | 'rank' | 'jett' | 'reyna' | 'sage', className?: string, colored?: boolean }) => {
  const icons = {
    vandal: 'https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/displayicon.png',
    phantom: 'https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png',
    spike: 'https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png',
    rank: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/smallicon.png',
    jett: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png',
    reyna: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png',
    sage: 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png'
  }

  const [hasError, setHasError] = useState(false)

  // 如果图标加载失败，显示后备图标
  if (hasError || type === 'spike') {
    const FallbackIcon = type === 'spike' ? Trophy : 
                        type === 'vandal' ? Sword :
                        type === 'phantom' ? Target : Trophy
    
    return (
      <FallbackIcon 
        className={`${className} ${
          type === 'spike' ? 'text-yellow-400 crown-effect' :
          type === 'vandal' ? 'text-red-400' :
          type === 'phantom' ? 'text-purple-400' : 'text-yellow-400'
        }`}
      />
    )
  }
  
  return (
    <img 
      src={icons[type]} 
      alt={type}
      className={`inline-block object-contain ${className}`}
      style={{ 
        filter: colored ? 'none' : 'brightness(0) invert(1)',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
      onError={() => setHasError(true)}
    />
  )
}

interface WeeklyBestProps {
  users: IUser[]
}

export default function WeeklyBest({ users }: WeeklyBestProps) {
  // 综合排名算法：标准化MMR和K/D后结合
  const getWeeklyBestUsers = () => {
    if (users.length === 0) return []
    
    // 找到最大值用于标准化
    const maxMMR = Math.max(...users.map(u => u.mmr || 0))
    const maxKD = Math.max(...users.map(u => u.kd || 0))
    
    // 防止除零
    if (maxMMR === 0 && maxKD === 0) return users.slice(0, 3)
    
    return [...users].sort((a, b) => {
      // 标准化分数 (0-1)
      const aNormalizedMMR = maxMMR > 0 ? (a.mmr || 0) / maxMMR : 0
      const aNormalizedKD = maxKD > 0 ? (a.kd || 0) / maxKD : 0
      
      const bNormalizedMMR = maxMMR > 0 ? (b.mmr || 0) / maxMMR : 0
      const bNormalizedKD = maxKD > 0 ? (b.kd || 0) / maxKD : 0
      
      // 综合得分 (MMR权重60%, K/D权重40%)
      const aCompositeScore = aNormalizedMMR * 0.6 + aNormalizedKD * 0.4
      const bCompositeScore = bNormalizedMMR * 0.6 + bNormalizedKD * 0.4
      
      return bCompositeScore - aCompositeScore
    }).slice(0, 3)
  }

  const weeklyBestUsers = getWeeklyBestUsers()

  const getCompositeScore = (user: IUser) => {
    const maxMMR = Math.max(...users.map(u => u.mmr || 0))
    const maxKD = Math.max(...users.map(u => u.kd || 0))
    
    const normalizedMMR = maxMMR > 0 ? (user.mmr || 0) / maxMMR : 0
    const normalizedKD = maxKD > 0 ? (user.kd || 0) / maxKD : 0
    
    return Math.round((normalizedMMR * 0.6 + normalizedKD * 0.4) * 100)
  }

  if (weeklyBestUsers.length === 0) return null

  return (
    <div className="min-h-screen valorant-bg relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 p-4 sm:p-6">
        {/* Main Title */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center mb-8 lg:mb-12"
        >
          <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-xl border-purple-500/50 valorant-teal-glow">
            <CardHeader className="py-4 sm:py-6 lg:py-8">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mx-auto mb-2 sm:mb-4"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center crown-effect">
                  <ValorantIcon type="spike" className="max-w-full max-h-full" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                VALORANT 牛逼战队排行榜
              </CardTitle>
              <p className="text-sm sm:text-lg lg:text-xl text-purple-200 mt-1 sm:mt-2">
                今天,你我誰更牛逼? 
              </p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 本周最牛逼战士展示 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8 lg:mb-12"
        >
          <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border-2 border-yellow-400/50 valorant-gold-glow">
            <CardHeader className="py-4 sm:py-6">
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    <ValorantIcon type="spike" className="max-w-full max-h-full" />
                  </div>
                </motion.div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  本周最牛逼战士
                </CardTitle>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                    <ValorantIcon type="rank" className="max-w-full max-h-full" />
                  </div>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                {weeklyBestUsers.map((user, index) => (
                  <motion.div
                    key={user._id?.toString()}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.7 + index * 0.2,
                      type: "spring",
                      bounce: 0.6
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <Card className={`${
                      index === 0 
                        ? 'bg-gradient-to-br from-yellow-500/40 to-orange-500/40 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/50' 
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-400/40 to-gray-600/40 border-2 border-gray-400 shadow-xl shadow-gray-500/30'
                        : 'bg-gradient-to-br from-amber-600/40 to-amber-800/40 border-2 border-amber-600 shadow-lg shadow-amber-500/20'
                    } backdrop-blur-xl hover:shadow-2xl transition-all duration-300`}>
                      <CardContent className="p-2 sm:p-4 text-center space-y-1 sm:space-y-3">
                        {/* 排名标识 */}
                        <div className="relative">
                          {index === 0 && (
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                              className="absolute -top-2 -right-2"
                            >
                              <Crown className="w-6 h-6 text-yellow-400 crown-effect" />
                            </motion.div>
                          )}
                          <Avatar className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto ring-2 sm:ring-4 ${
                            index === 0 ? 'ring-yellow-400' :
                            index === 1 ? 'ring-gray-400' : 'ring-amber-400'
                          } ring-offset-2 ring-offset-slate-900`}>
                            <AvatarImage
                              src={`/photos/${user.photoPath}`}
                              alt={user.realName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-sm sm:text-xl">
                              {user.realName[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* 用户名 */}
                        <h3 className="text-xs sm:text-lg lg:text-xl font-bold text-white truncate">
                          {user.realName}
                        </h3>

                        {/* 综合得分 */}
                        <div className="space-y-2">
                          <div className={`text-lg sm:text-2xl lg:text-3xl font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' : 'text-amber-400'
                          }`}>
                            {getCompositeScore(user)}
                          </div>
                          <div className="text-xs text-gray-400">综合得分</div>
                        </div>

                        {/* 详细数据 */}
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-purple-400">{user.mmr || 0}</div>
                            <div className="text-gray-400">MMR</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-red-400">{user.kd || 0}</div>
                            <div className="text-gray-400">K/D</div>
                          </div>
                        </div>

                        {/* 排名徽章 */}
                        <div className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-lg font-bold ${
                          index === 0 ? 'bg-yellow-400 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' : 'bg-amber-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 地图数据展示 */}
        <MapDisplay users={users} />
      </div>
    </div>
  )
}