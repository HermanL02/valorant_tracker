'use client'

import { useEffect, useState } from 'react'
import WeeklyBest from '@/components/WeeklyBest'
import MapDisplay from '@/components/MapDisplay'
import Leaderboard from '@/components/Leaderboard'
import { IUser } from '@/models/User'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sprout, RotateCcw, RefreshCw, Trophy, Map, Home, Users } from 'lucide-react'
import Link from 'next/link'

// Rolling Sage Icon Component
const RollingSageIcon = ({ className }: { className?: string }) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <Loader2 className={`${className} animate-spin`} />
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

export default function HomePage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const userData = await response.json()
      setUsers(userData)
      setError(null)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('用户数据加载失败，请尝试刷新页面。')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/users/seed', {
        method: 'POST',
      })
      
      if (response.ok) {
        alert('数据库初始化成功!')
        fetchUsers() // Refresh the data
      } else {
        alert('数据库初始化失败')
      }
    } catch (error) {
      console.error('Error seeding database:', error)
      alert('数据库初始化错误')
    }
  }

  const updateUser = async () => {
    try {
      const response = await fetch('/api/cron', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`已更新: ${data.updated || '用户更新成功'}`)
        fetchUsers() // Refresh the data
      } else {
        const errorData = await response.json()
        alert(`更新失败: ${errorData.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('用户更新错误')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen valorant-bg flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative z-10">
        <Card className="bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-purple-500/30">
          <CardContent className="p-12 text-center">
            <RollingSageIcon className="w-16 h-16 text-purple-400 mx-auto mb-6 glow" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 pulse-glow">正在召集牛逼战队成员...</h2>
            <p className="text-purple-200 text-lg floating">Sage 正在准备治疗...</p>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen valorant-bg flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="relative z-10">
        <Card className="bg-slate-800/90 shadow-2xl border-2 border-red-500 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6 animate-bounce">💀</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">战斗中断</h2>
            <p className="text-red-300 text-xl mb-6">{error}</p>
            <Button 
              onClick={fetchUsers} 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 glow hover:scale-110 transition-all duration-300"
            >
              <span className="mr-2">⚔️</span>
              重返战场
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen valorant-bg relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10">
        <Tabs defaultValue="home" className="w-full">
          {/* Tab Navigation */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/50 border-b border-purple-500/30">
            <div className="container mx-auto px-4 py-4">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-slate-800/80 backdrop-blur-xl border border-purple-500/30">
                <TabsTrigger value="home" className="flex items-center gap-2 text-purple-200 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-500/20">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">首页</span>
                </TabsTrigger>
                <TabsTrigger value="rankings" className="flex items-center gap-2 text-purple-200 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-500/20">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">排行榜</span>
                </TabsTrigger>
                <TabsTrigger value="maps" className="flex items-center gap-2 text-purple-200 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-500/20">
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">地图</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="home" className="mt-0">
            <WeeklyBest users={users} />
          </TabsContent>

          <TabsContent value="rankings" className="mt-0 p-4">
            <div className="min-h-screen">
              <Leaderboard users={users} />
            </div>
          </TabsContent>

          <TabsContent value="maps" className="mt-0 p-4">
            <div className="min-h-screen">
              <MapDisplay users={users} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Admin Controls - Moved to bottom right */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-30">
          <Button
            onClick={seedDatabase}
            size="sm"
            variant="outline"
            className="bg-green-600/80 hover:bg-green-700 border-green-500 text-white backdrop-blur-xl glow hover:scale-105 transition-all duration-300"
          >
            <Sprout className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">初始化</span>
          </Button>
          
          <Button
            onClick={updateUser}
            size="sm"
            variant="outline"
            className="bg-orange-600/80 hover:bg-orange-700 border-orange-500 text-white backdrop-blur-xl glow hover:scale-105 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">更新</span>
          </Button>
          
          <Button
            onClick={fetchUsers}
            size="sm"
            variant="outline"
            className="bg-blue-600/80 hover:bg-blue-700 border-blue-500 text-white backdrop-blur-xl glow hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">刷新</span>
          </Button>
        </div>
      </div>
    </main>
  )
}