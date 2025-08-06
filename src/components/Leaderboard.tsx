'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IUser } from '@/models/User'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Crown, Trophy, Medal } from 'lucide-react'

interface LeaderboardProps {
  users: IUser[]
}

type LeaderboardType = 'mmr' | 'kd'

export default function Leaderboard({ users }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('mmr')

  const getSortedUsers = (type: LeaderboardType) => {
    return [...users].sort((a, b) => {
      if (type === 'mmr') {
        // Sort by MMR first, then by K/D ratio
        if ((b.mmr || 0) !== (a.mmr || 0)) {
          return (b.mmr || 0) - (a.mmr || 0)
        }
        return (b.kd || 0) - (a.kd || 0)
      } else {
        // Sort by K/D first, then by MMR
        if ((b.kd || 0) !== (a.kd || 0)) {
          return (b.kd || 0) - (a.kd || 0)
        }
        return (b.mmr || 0) - (a.mmr || 0)
      }
    })
  }

  const sortedUsers = getSortedUsers(activeTab)
  const top3 = sortedUsers.slice(0, 3)
  const rest = sortedUsers.slice(3)

  const getPrimaryValue = (user: IUser) => {
    return activeTab === 'mmr' ? user.mmr || 0 : user.kd || 0
  }

  const getSecondaryValue = (user: IUser) => {
    return activeTab === 'mmr' ? user.kd || 0 : user.mmr || 0
  }

  const getPrimaryLabel = () => {
    return activeTab === 'mmr' ? 'MMR' : 'K/D'
  }

  const getSecondaryLabel = () => {
    return activeTab === 'mmr' ? 'K/D' : 'MMR'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-xl border-purple-500/50 valorant-teal-glow mx-auto max-w-2xl">
          <CardHeader className="py-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mx-auto mb-4"
            >
              <Trophy className="w-16 h-16 text-yellow-400 crown-effect" />
            </motion.div>
            <CardTitle className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              VALORANT 排行榜
            </CardTitle>
            <p className="text-lg text-purple-200 mt-2">
              谁是最强战士?
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-center"
      >
        <div className="flex bg-slate-800/80 backdrop-blur-xl rounded-lg border border-purple-500/30 p-1">
          <button 
            className={`px-6 py-3 rounded-md transition-all duration-300 font-semibold ${
              activeTab === 'mmr' 
                ? 'bg-purple-500/30 text-purple-200 shadow-lg' 
                : 'text-gray-400 hover:text-purple-300'
            }`}
            onClick={() => setActiveTab('mmr')}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            MMR 排行榜
          </button>
          <button 
            className={`px-6 py-3 rounded-md transition-all duration-300 font-semibold ${
              activeTab === 'kd' 
                ? 'bg-purple-500/30 text-purple-200 shadow-lg' 
                : 'text-gray-400 hover:text-purple-300'
            }`}
            onClick={() => setActiveTab('kd')}
          >
            <Medal className="w-4 h-4 inline mr-2" />
            K/D 排行榜
          </button>
        </div>
      </motion.div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center items-end space-x-2 sm:space-x-4"
        >
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring", bounce: 0.6 }}
              className="flex flex-col items-center"
            >
              <Card className="bg-gradient-to-br from-gray-400/40 to-gray-600/40 backdrop-blur-xl border-2 border-gray-400 shadow-xl shadow-gray-500/30 p-3 sm:p-4 mb-4">
                <CardContent className="p-0 text-center">
                  <div className="relative mb-3">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto ring-4 ring-gray-400 ring-offset-2 ring-offset-slate-900">
                      <AvatarImage
                        src={`/photos/${top3[1].photoPath}`}
                        alt={top3[1].realName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-bold">
                        {top3[1].realName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">{top3[1].realName}</h3>
                  <div className="text-xs sm:text-sm text-gray-300 font-semibold">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[1])}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[1])}
                  </div>
                </CardContent>
              </Card>
              <div className="bg-gradient-to-t from-gray-600 to-gray-400 h-16 w-16 sm:h-20 sm:w-20 rounded-t-lg"></div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.6 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="mb-4"
              >
                <Crown className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 crown-effect" />
              </motion.div>
              <Card className="bg-gradient-to-br from-yellow-500/40 to-orange-500/40 backdrop-blur-xl border-2 border-yellow-400 shadow-2xl shadow-yellow-500/50 p-4 sm:p-6 mb-4">
                <CardContent className="p-0 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900">
                      <AvatarImage
                        src={`/photos/${top3[0].photoPath}`}
                        alt={top3[0].realName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white font-bold text-lg">
                        {top3[0].realName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg">{top3[0].realName}</h3>
                  <div className="text-sm sm:text-base font-bold text-yellow-400">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[0])}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[0])}
                  </div>
                </CardContent>
              </Card>
              <div className="bg-gradient-to-t from-yellow-600 to-yellow-400 h-20 w-20 sm:h-24 sm:w-24 rounded-t-lg"></div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.9, type: "spring", bounce: 0.6 }}
              className="flex flex-col items-center"
            >
              <Card className="bg-gradient-to-br from-amber-600/40 to-amber-800/40 backdrop-blur-xl border-2 border-amber-600 shadow-lg shadow-amber-500/20 p-3 sm:p-4 mb-4">
                <CardContent className="p-0 text-center">
                  <div className="relative mb-3">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900">
                      <AvatarImage
                        src={`/photos/${top3[2].photoPath}`}
                        alt={top3[2].realName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold">
                        {top3[2].realName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">{top3[2].realName}</h3>
                  <div className="text-xs sm:text-sm text-amber-300 font-semibold">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[2])}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[2])}
                  </div>
                </CardContent>
              </Card>
              <div className="bg-gradient-to-t from-amber-700 to-amber-600 h-12 w-16 sm:h-16 sm:w-20 rounded-t-lg"></div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Rest of the players */}
      {rest.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Card className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-blue-400/50">
            <CardHeader className="py-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚔️ 其他战士 ⚔️
              </CardTitle>
            </CardHeader>
          </Card>
          
          <div className="space-y-4">
            {rest.map((user, index) => (
              <motion.div
                key={user._id?.toString()}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-slate-800/60 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900">
                          <AvatarImage
                            src={`/photos/${user.photoPath}`}
                            alt={user.realName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                            {user.realName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-700 border border-purple-400 rounded-full flex items-center justify-center text-purple-200 text-xs font-bold">
                          {index + 4}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{user.realName}</h3>
                        <p className="text-gray-400 text-sm truncate">{user.riotUserName}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <div className="text-xs text-gray-400">MMR</div>
                          <div className="text-sm sm:text-base font-bold text-purple-400">{user.mmr || 0}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <div className="text-xs text-gray-400">K/D</div>
                          <div className="text-sm sm:text-base font-bold text-red-400">{user.kd || '0.00'}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <div className="text-xs text-gray-400">场次</div>
                          <div className="text-sm sm:text-base font-bold text-blue-400">{user.matchesPlayed || 0}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-2">
                          <div className="text-xs text-gray-400">段位</div>
                          <div className="text-xs sm:text-sm font-bold text-yellow-400 truncate">{user.rank || 'Unranked'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded border border-purple-500/30">
                        {getPrimaryLabel()}: {getPrimaryValue(user)}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded border border-blue-500/30">
                        {getSecondaryLabel()}: {getSecondaryValue(user)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}