import express from 'express'
import multer from 'multer'
import ort from 'onnxruntime-node'
import fs from 'fs'
import path from 'path'

interface InferenceResult {
  label: string
  score: number
}

class OnnxInferenceServer {
  private app: express.Application
  private port: number
  private modelPath: string
  private labels: string[]
  private session: ort.InferenceSession | null = null
  private server: any

  constructor(port: number, modelPath: string, labels: string[]) {
    this.app = express()
    this.port = port
    this.modelPath = modelPath
    this.labels = labels
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', modelLoaded: this.session !== null })
    })

    // Predict endpoint
    this.app.post('/predict', async (req, res) => {
      try {
        if (!this.session) {
          return res.status(503).json({ error: 'Model not loaded' })
        }

        const { image } = req.body
        if (!image) {
          return res.status(400).json({ error: 'No image provided' })
        }

        // Decode base64 image
        const imageBuffer = Buffer.from(image, 'base64')
        
        // Run inference
        const results = await this.runInference(imageBuffer)
        
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

  private async runInference(imageBuffer: Buffer): Promise<InferenceResult[]> {
    // TODO: 根据你的模型输入格式预处理图像
    // 这里需要根据你的 ONNX 模型输入格式来实现
    // 示例：假设模型接受 224x224 的 RGB 图像
    
    const inputShape = [1, 3, 224, 224] // batch, channels, height, width
    const inputData = new Float32Array(1 * 3 * 224 * 224)
    
    // 这里需要添加图像预处理逻辑
    // 例如：调整大小、归一化等
    
    const tensor = new ort.Tensor('float32', inputData, inputShape)
    const feeds: Record<string, ort.Tensor> = {}
    
    // 获取输入名称（通常需要查看模型）
    const inputName = this.session!.inputNames[0]
    feeds[inputName] = tensor

    const results = await this.session!.run(feeds)
    const outputName = this.session!.outputNames[0]
    const output = results[outputName] as ort.Tensor

    // 处理输出结果
    const outputData = output.data as Float32Array
    const predictions: InferenceResult[] = []

    for (let i = 0; i < this.labels.length; i++) {
      predictions.push({
        label: this.labels[i],
        score: Math.max(0, Math.min(1, outputData[i] || 0))
      })
    }

    // 按分数排序
    predictions.sort((a, b) => b.score - a.score)

    return predictions
  }

  async loadModel() {
    try {
      if (!fs.existsSync(this.modelPath)) {
        throw new Error(`Model not found: ${this.modelPath}`)
      }
      
      this.session = await ort.InferenceSession.create(this.modelPath)
      console.log(`[ONNX Server] Model loaded from ${this.modelPath}`)
      console.log(`[ONNX Server] Input names: ${this.session.inputNames}`)
      console.log(`[ONNX Server] Output names: ${this.session.outputNames}`)
    } catch (error) {
      console.error('[ONNX Server] Failed to load model:', error)
      throw error
    }
  }

  async start(): Promise<void> {
    await this.loadModel()
    
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[ONNX Server] Running on port ${this.port}`)
        resolve()
      })

      this.server.on('error', (err: any) => {
        console.error('[ONNX Server] Failed to start:', err)
        reject(err)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log(`[ONNX Server] Stopped on port ${this.port}`)
          resolve()
        })
      })
    }
  }
}

export { OnnxInferenceServer }
