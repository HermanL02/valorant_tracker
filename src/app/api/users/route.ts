import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import fs from 'fs'
import path from 'path'

async function seedDatabaseIfEmpty() {
  try {
    await dbConnect()
    const userCount = await User.countDocuments()
    
    if (userCount === 0) {
      console.log('Database is empty, seeding from users.json...')
      
      // Read the users.json file
      const usersFilePath = path.join(process.cwd(), 'users.json')
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))
      
      // Seed the database with initial user data
      for (const userData of usersData) {
        await User.create({
          riotUserName: userData.RiotUserName,
          realName: userData.RealName,
          photoPath: userData.PhotoPath,
          mmr: 0,
          kd: 0,
          matchesPlayed: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          firstBloods: 0,
        })
      }
      
      console.log(`Seeded database with ${usersData.length} users`)
    }
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

export async function GET() {
  try {
    await dbConnect()
    
    // Check if database is empty and seed if necessary
    await seedDatabaseIfEmpty()
    
    const users = await User.find({}).sort({ mmr: -1, kd: -1 })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await dbConnect()
    
    const user = await User.findOneAndUpdate(
      { riotUserName: body.riotUserName },
      { ...body, lastUpdated: new Date() },
      { upsert: true, new: true }
    )
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}