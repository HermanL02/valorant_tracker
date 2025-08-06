import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  riotUserName: string
  realName: string
  photoPath: string
  rank?: string
  rankTier?: number
  mmr?: number
  kd?: number
  matchesPlayed?: number
  kills?: number
  deaths?: number
  assists?: number
  firstBloods?: number
  // 地图相关数据
  mapStats?: {
    [mapName: string]: {
      wins: number
      games: number
      winRate: number
    }
  }
  bestMap?: string
  bestMapWinRate?: number
  lastUpdated?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  riotUserName: { type: String, required: true, unique: true },
  realName: { type: String, required: true },
  photoPath: { type: String, required: true },
  rank: { type: String },
  rankTier: { type: Number },
  mmr: { type: Number },
  kd: { type: Number },
  matchesPlayed: { type: Number },
  kills: { type: Number },
  deaths: { type: Number },
  assists: { type: Number },
  firstBloods: { type: Number },
  // 地图相关数据
  mapStats: { type: Schema.Types.Mixed },
  bestMap: { type: String },
  bestMapWinRate: { type: Number },
  lastUpdated: { type: Date },
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)