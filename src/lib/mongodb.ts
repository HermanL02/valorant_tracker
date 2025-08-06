import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Only throw error in production or when explicitly running with MongoDB
if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

interface GlobalMongoDB {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongodb: GlobalMongoDB | undefined
}

let cached = global.mongodb || { conn: null, promise: null }

if (!global.mongodb) {
  global.mongodb = cached
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect