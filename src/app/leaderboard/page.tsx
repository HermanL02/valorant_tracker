'use client'

import { useEffect, useState } from 'react'
import LeaderboardOnly from '@/components/LeaderboardOnly'
import { IUser } from '@/models/User'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LeaderboardPage() {
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
            <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-6 glow" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 pulse-glow">正在加载排行榜</h2>
            <p className="text-purple-200 text-lg floating">正在召集战士数据...</p>
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
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={fetchUsers} 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 glow hover:scale-110 transition-all duration-300"
              >
                <span className="mr-2">⚔️</span>
                重返战场
              </Button>
              <Link href="/">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-400 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回主页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="relative">
      {/* 返回主页按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/">
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800/80 hover:bg-slate-700/80 border-purple-500/30 text-white backdrop-blur-xl glow hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">返回主页</span>
            <span className="sm:hidden">主页</span>
          </Button>
        </Link>
      </div>

      <LeaderboardOnly users={users} />
    </main>
  )
}