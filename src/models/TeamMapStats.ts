import mongoose, { Schema, Document } from 'mongoose'

export interface ITeamMapStats extends Document {
  bestTeamMap: string
  bestTeamWinRate: number
  teamMapStats: {
    [mapName: string]: {
      wins: number
      games: number
    }
  }
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const TeamMapStatsSchema: Schema = new Schema({
  bestTeamMap: { type: String, required: true },
  bestTeamWinRate: { type: Number, required: true },
  teamMapStats: { type: Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true
})

export default mongoose.models.TeamMapStats || mongoose.model<ITeamMapStats>('TeamMapStats', TeamMapStatsSchema)