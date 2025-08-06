'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IUser } from '@/models/User'

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
    <div className="min-h-screen bg-base-200 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary mb-4 animate-pulse">
          🏆 VALORANT LEGENDS 🏆
        </h1>
        <p className="text-xl text-base-content/70">Battle for Glory and Honor!</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="tabs tabs-boxed bg-base-300">
          <button 
            className={`tab tab-lg ${activeTab === 'mmr' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('mmr')}
          >
            🎯 MMR Leaderboard
          </button>
          <button 
            className={`tab tab-lg ${activeTab === 'kd' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('kd')}
          >
            ⚔️ K/D Leaderboard
          </button>
        </div>
      </div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end mb-12 space-x-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex flex-col items-center">
              <div className="card bg-secondary/20 backdrop-blur-sm border border-secondary/30 p-4 mb-4 animate-bounce">
                <div className="relative">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                      <Image
                        src={`/photos/${top3[1].photoPath}`}
                        alt={top3[1].realName}
                        width={64}
                        height={64}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/photos/Herman.jpg'
                        }}
                      />
                    </div>
                  </div>
                  <div className="badge badge-secondary absolute -top-2 -right-2">2</div>
                </div>
                <div className="text-center mt-2">
                  <h3 className="font-bold text-base-content">{top3[1].realName}</h3>
                  <div className="text-sm text-base-content/70">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[1])}
                  </div>
                  <div className="text-xs text-base-content/50">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[1])}
                  </div>
                </div>
              </div>
              <div className="bg-secondary h-20 w-20 rounded-t-lg"></div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex flex-col items-center">
              <div className="text-4xl animate-bounce mb-2">👑</div>
              <div className="card bg-primary/20 backdrop-blur-sm border border-primary/30 p-6 mb-4">
                <div className="relative">
                  <div className="avatar">
                    <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                      <Image
                        src={`/photos/${top3[0].photoPath}`}
                        alt={top3[0].realName}
                        width={80}
                        height={80}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/photos/Herman.jpg'
                        }}
                      />
                    </div>
                  </div>
                  <div className="badge badge-primary absolute -top-2 -right-2">1</div>
                </div>
                <div className="text-center mt-3">
                  <h3 className="font-bold text-lg text-base-content">{top3[0].realName}</h3>
                  <div className="text-base font-semibold text-primary">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[0])}
                  </div>
                  <div className="text-sm text-base-content/70">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[0])}
                  </div>
                </div>
              </div>
              <div className="bg-primary h-24 w-24 rounded-t-lg"></div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex flex-col items-center">
              <div className="card bg-accent/20 backdrop-blur-sm border border-accent/30 p-4 mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
                <div className="relative">
                  <div className="avatar">
                    <div className="w-16 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">
                      <Image
                        src={`/photos/${top3[2].photoPath}`}
                        alt={top3[2].realName}
                        width={64}
                        height={64}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/photos/Herman.jpg'
                        }}
                      />
                    </div>
                  </div>
                  <div className="badge badge-accent absolute -top-2 -right-2">3</div>
                </div>
                <div className="text-center mt-2">
                  <h3 className="font-bold text-base-content">{top3[2].realName}</h3>
                  <div className="text-sm text-base-content/70">
                    {getPrimaryLabel()}: {getPrimaryValue(top3[2])}
                  </div>
                  <div className="text-xs text-base-content/50">
                    {getSecondaryLabel()}: {getSecondaryValue(top3[2])}
                  </div>
                </div>
              </div>
              <div className="bg-accent h-16 w-20 rounded-t-lg"></div>
            </div>
          )}
        </div>
      )}

      {/* Rest of the players */}
      {rest.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-base-content mb-8">
            ⚔️ Warriors of the Rift ⚔️
          </h2>
          <div className="space-y-4">
            {rest.map((user, index) => (
              <div
                key={user._id?.toString()}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="card-body">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="avatar">
                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <Image
                            src={`/photos/${user.photoPath}`}
                            alt={user.realName}
                            width={64}
                            height={64}
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/photos/Herman.jpg'
                            }}
                          />
                        </div>
                      </div>
                      <div className="badge badge-neutral absolute -top-2 -left-2">
                        {index + 4}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-base-content">{user.realName}</h3>
                      <p className="text-base-content/60 text-sm">{user.riotUserName}</p>
                    </div>
                    
                    <div className="stats stats-horizontal shadow">
                      <div className="stat p-2">
                        <div className="stat-title text-xs">MMR</div>
                        <div className="stat-value text-primary text-lg">{user.mmr || 0}</div>
                      </div>
                      <div className="stat p-2">
                        <div className="stat-title text-xs">K/D</div>
                        <div className="stat-value text-secondary text-lg">{user.kd || '0.00'}</div>
                      </div>
                      <div className="stat p-2">
                        <div className="stat-title text-xs">Matches</div>
                        <div className="stat-value text-accent text-lg">{user.matchesPlayed || 0}</div>
                      </div>
                      <div className="stat p-2">
                        <div className="stat-title text-xs">Rank</div>
                        <div className="stat-value text-neutral text-sm">{user.rank || 'Unranked'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-end">
                    <div className="badge badge-outline">{getPrimaryLabel()}: {getPrimaryValue(user)}</div>
                    <div className="badge badge-outline">{getSecondaryLabel()}: {getSecondaryValue(user)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}