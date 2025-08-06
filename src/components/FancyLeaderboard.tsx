'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { IUser } from '@/models/User'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Trophy, Sword, Target, Crown, Star, Zap } from 'lucide-react'

interface LeaderboardProps {
  users: IUser[]
}

type LeaderboardType = 'mmr' | 'kd'

export default function FancyLeaderboard({ users }: LeaderboardProps) {
  const getSortedUsers = (type: LeaderboardType) => {
    return [...users].sort((a, b) => {
      if (type === 'mmr') {
        if ((b.mmr || 0) !== (a.mmr || 0)) {
          return (b.mmr || 0) - (a.mmr || 0)
        }
        return (b.kd || 0) - (a.kd || 0)
      } else {
        if ((b.kd || 0) !== (a.kd || 0)) {
          return (b.kd || 0) - (a.kd || 0)
        }
        return (b.mmr || 0) - (a.mmr || 0)
      }
    })
  }

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

  const mmrUsers = getSortedUsers('mmr')
  const kdUsers = getSortedUsers('kd')
  const weeklyBestUsers = getWeeklyBestUsers()
  
  const mmrTop3 = mmrUsers.slice(0, 3)
  const kdTop3 = kdUsers.slice(0, 3)
  const mmrRest = mmrUsers.slice(3)
  const kdRest = kdUsers.slice(3)

  const getPrimaryValue = (user: IUser, type: LeaderboardType) => {
    return type === 'mmr' ? user.mmr || 0 : user.kd || 0
  }

  const getSecondaryValue = (user: IUser, type: LeaderboardType) => {
    return type === 'mmr' ? user.kd || 0 : user.mmr || 0
  }

  const PodiumCard = ({ user, position, type }: { user: IUser, position: number, type: LeaderboardType }) => {
    const podiumConfig = {
      1: { 
        size: 'w-20 h-28 sm:w-24 sm:h-32 lg:w-28 lg:h-36', 
        avatar: 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8', 
        title: '👑',
        bgGradient: 'from-yellow-500/40 to-orange-500/40',
        borderColor: 'border-yellow-400',
        delay: 0.2,
        y: -30
      },
      2: { 
        size: 'w-18 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32', 
        avatar: 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7', 
        title: '🥈',
        bgGradient: 'from-gray-400/40 to-gray-600/40',
        borderColor: 'border-gray-400',
        delay: 0.4,
        y: -20
      },
      3: { 
        size: 'w-18 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32', 
        avatar: 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7', 
        title: '🥉',
        bgGradient: 'from-amber-600/40 to-amber-800/40',
        borderColor: 'border-amber-600',
        delay: 0.6,
        y: -15
      }
    }

    const config = podiumConfig[position as keyof typeof podiumConfig]

    return (
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ y: config.y, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: config.delay,
          type: "spring",
          bounce: 0.4
        }}
        whileHover={{ scale: 1.05, y: config.y - 5 }}
        className="flex flex-col items-center"
      >
        {position === 1 && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mb-1"
          >
            <Crown className="w-5 h-5 text-yellow-400 crown-effect" />
          </motion.div>
        )}
        
        <Card className={`${config.size} bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl border-2 ${config.borderColor} glow`}>
          <CardContent className="p-1 sm:p-2 flex flex-col items-center text-center h-full justify-between space-y-1">
            <Avatar className={`${config.avatar} ring-4 ring-${position === 1 ? 'yellow' : position === 2 ? 'gray' : 'amber'}-400 ring-offset-2 ring-offset-slate-900 shadow-xl`}>
              <AvatarImage
                src={`/photos/${user.photoPath}`}
                alt={user.realName}
                className="object-cover"
              />
              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                {user.realName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-sm sm:text-base lg:text-lg">
              {config.title}
            </div>
            
            <div>
              <h3 className="text-xs sm:text-xs lg:text-sm font-bold text-white truncate max-w-full">{user.realName}</h3>
              <div className="text-xs sm:text-sm font-bold text-white">
                {getPrimaryValue(user, type)}
              </div>
              <div className="text-xs text-gray-300">
                {type === 'mmr' ? 'MMR' : 'K/D'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Podium Base */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: config.delay + 0.3 }}
          className={`${position === 1 ? 'w-24 sm:w-28 lg:w-32' : 'w-20 sm:w-24 lg:w-28'} bg-gradient-to-t ${
            position === 1 ? 'from-yellow-500 via-yellow-400 to-yellow-300 h-20 shadow-2xl shadow-yellow-500/50' : 
            position === 2 ? 'from-gray-500 via-gray-400 to-gray-300 h-16 shadow-2xl shadow-gray-500/50' : 
            'from-amber-600 via-amber-500 to-amber-400 h-12 shadow-2xl shadow-amber-500/50'
          } rounded-t-lg origin-bottom relative overflow-hidden`}
        >
          {/* Podium decorative elements */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            position === 1 ? 'from-transparent via-yellow-200/30 to-transparent' :
            position === 2 ? 'from-transparent via-gray-200/30 to-transparent' :
            'from-transparent via-amber-200/30 to-transparent'
          } animate-pulse`} />
          
          {/* Podium number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-3xl text-white drop-shadow-lg ${
              position === 1 ? 'text-shadow-gold' : ''
            }`}>
              {position}
            </span>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const LeaderboardSection = ({ title, icon, users, top3, rest, type }: {
    title: string
    icon: React.ReactNode
    users: IUser[]
    top3: IUser[]
    rest: IUser[]
    type: LeaderboardType
  }) => (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl border-purple-500/30">
          <CardHeader className="py-3 sm:py-4 lg:py-6">
            <CardTitle className="flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {icon}
              <span className="ml-2 sm:ml-3">{title}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Podium Stage */}
      {top3.length > 0 && (
        <div className="relative mb-8">
          {/* Stage lighting effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-10 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Confetti/sparkle effects */}
          <div className="absolute inset-0 -z-5">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${
                  i % 3 === 0 ? 'bg-yellow-400' : 
                  i % 3 === 1 ? 'bg-purple-400' : 
                  'bg-blue-400'
                } rounded-full opacity-60`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20],
                  x: [-10, 10],
                  rotate: [0, 360],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Stage platform */}
          <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-md rounded-3xl p-4 sm:p-6 lg:p-8 mx-auto max-w-4xl relative overflow-hidden border border-purple-500/30">
            {/* Stage floor pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
            
            <div className="flex justify-center items-end space-x-2 sm:space-x-4 lg:space-x-6 relative z-10">
              {top3[1] && <PodiumCard user={top3[1]} position={2} type={type} />}
              {top3[0] && <PodiumCard user={top3[0]} position={1} type={type} />}
              {top3[2] && <PodiumCard user={top3[2]} position={3} type={type} />}
            </div>
            
            {/* Stage curtains effect */}
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-900/40 to-transparent"></div>
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-red-900/40 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Rest of the leaderboard */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {rest.map((user, index) => (
            <motion.div
              key={user._id?.toString()}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-xl hover:from-slate-700/80 hover:via-slate-600/80 hover:to-slate-700/80 transition-all duration-300 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Rank */}
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-400/30">
                      <span className="text-sm font-bold text-white drop-shadow">#{index + 4}</span>
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 ring-1 ring-purple-400 ring-offset-1 ring-offset-slate-800">
                      <AvatarImage
                        src={`/photos/${user.photoPath}`}
                        alt={user.realName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">{user.realName[0]}</AvatarFallback>
                    </Avatar>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{user.realName}</h3>
                      <p className="text-xs text-gray-400 truncate">{user.riotUserName}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold text-white">
                        {getPrimaryValue(user, type)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {type === 'mmr' ? 'MMR' : 'K/D'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2 sm:mt-3">
                    <Progress 
                      value={Math.min(100, (getPrimaryValue(user, type) / (users[0] ? getPrimaryValue(users[0], type) : 1)) * 100)} 
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  // 本周最牛逼展示组件
  const WeeklyBestSection = () => {
    if (weeklyBestUsers.length === 0) return null

    const getCompositeScore = (user: IUser) => {
      const maxMMR = Math.max(...users.map(u => u.mmr || 0))
      const maxKD = Math.max(...users.map(u => u.kd || 0))
      
      const normalizedMMR = maxMMR > 0 ? (user.mmr || 0) / maxMMR : 0
      const normalizedKD = maxKD > 0 ? (user.kd || 0) / maxKD : 0
      
      return Math.round((normalizedMMR * 0.6 + normalizedKD * 0.4) * 100)
    }

    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mb-8 lg:mb-12"
      >
        <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl border-2 border-yellow-400/50 glow">
          <CardHeader className="py-4 sm:py-6">
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </motion.div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                本周最牛逼战士
              </CardTitle>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
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
    )
  }

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
          <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-xl border-purple-500/50">
            <CardHeader className="py-4 sm:py-6 lg:py-8">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mx-auto mb-2 sm:mb-4"
              >
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-yellow-400 crown-effect" />
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
        <WeeklyBestSection />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* MMR Leaderboard */}
          <LeaderboardSection
            title="MMR 排行榜"
            icon={<Target className="w-6 h-6 text-purple-400" />}
            users={mmrUsers}
            top3={mmrTop3}
            rest={mmrRest}
            type="mmr"
          />

          {/* K/D Leaderboard */}
          <LeaderboardSection
            title="K/D 排行榜"
            icon={<Sword className="w-6 h-6 text-red-400" />}
            users={kdUsers}
            top3={kdTop3}
            rest={kdRest}
            type="kd"
          />
        </div>
      </div>
    </div>
  )
}