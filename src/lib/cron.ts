import cron from 'node-cron'

let isRunning = false

export function startCronJob() {
  // In production (Vercel), crons are handled by vercel.json
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode - cron jobs handled by Vercel')
    return
  }
  
  if (isRunning) return
  
  // Run every 5 minutes to update one user at a time (local development only)
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running local cron job to update user data...')
      
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Cron job completed:', data.message || data.error)
      } else {
        console.error('Cron job failed with status:', response.status)
      }
    } catch (error) {
      console.error('Cron job error:', error)
    }
  })
  
  isRunning = true
  console.log('Local cron job started - will run every 5 minutes')
}