import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    await dbConnect()
    
    // Read the users.json file
    const usersFilePath = path.join(process.cwd(), 'users.json')
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))
    
    // Seed the database with initial user data
    for (const userData of usersData) {
      await User.findOneAndUpdate(
        { riotUserName: userData.RiotUserName },
        {
          riotUserName: userData.RiotUserName,
          realName: userData.RealName,
          photoPath: userData.PhotoPath,
        },
        { upsert: true }
      )
    }
    
    return NextResponse.json({ message: 'Database seeded successfully', count: usersData.length })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}