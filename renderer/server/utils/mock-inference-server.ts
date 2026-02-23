import express from 'express'
import cors from 'cors'

interface InferenceResult {
  label: string
  score: number
}

class MockInferenceServer {
  private app: express.Application
  private port: number
  private labels: string[]
  private server: any

  constructor(port: number, labels: string[]) {
    this.app = express()
    this.port = port
    this.labels = labels
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    this.app.use(cors())
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', modelLoaded: true })
    })

    // Predict endpoint
    this.app.post('/predict', async (req, res) => {
      try {
        const { image } = req.body
        if (!image) {
          return res.status(400).json({ error: 'No image provided' })
        }

        // 模拟推理延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 生成模拟推理结果
        const results = this.generateMockResults()
        
        res.json({
          status: 'success',
          predictions: results
        })
      } catch (error: any) {
        console.error('Inference error:', error)
        res.status(500).json({ error: error.message || 'Inference failed' })
      }
    })
  }

  private generateMockResults(): InferenceResult[] {
    // 生成随机分数并排序
    const results: InferenceResult[] = this.labels.map(label => ({
      label,
      score: Math.random()
    }))

    // 排序：最高分在前
    results.sort((a, b) => b.score - a.score)

    return results
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[Mock Inference Server] Running on port ${this.port}`)
        console.log(`[Mock Inference Server] Labels: ${this.labels.join(', ')}`)
        resolve()
      })

      this.server.on('error', (err: any) => {
        console.error('[Mock Inference Server] Failed to start:', err)
        reject(err)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log(`[Mock Inference Server] Stopped on port ${this.port}`)
          resolve()
        })
      })
    }
  }
}

export { MockInferenceServer }
