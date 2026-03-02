import express from 'express'
import cors from 'cors'
import ort from 'onnxruntime-node'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import sharp from 'sharp'

interface InferenceConfig {
  input: {
    dtype: string
    name: string
    shape: number[]
  }
  model_type: string
  output: {
    description: string
    name: string
  }
  postprocess: {
    threshold: number
    type: string
  }
  preprocess: {
    bgr_to_rgb: boolean
    normalize: {
      mean: number[]
      std: number[]
    }
    resize: {
      height: number
      width: number
    }
    scale: number
    to_rgb: boolean
  }
}

interface InferenceResult {
  label: string
  score: number
  is_anomaly?: boolean
}

class InferenceServer {
  private app: express.Application
  private port: number
  private modelPath: string
  private configPath: string
  private labels: string[]
  private session: ort.InferenceSession | null = null
  private config: InferenceConfig | null = null
  private server: any

  constructor(port: number, modelPath: string, configPath: string, labels: string[]) {
    this.app = express()
    this.port = port
    this.modelPath = modelPath
    this.configPath = configPath
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
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        modelLoaded: this.session !== null,
        configLoaded: this.config !== null,
        modelType: this.config?.model_type || 'unknown'
      })
    })

    this.app.post('/predict', async (req, res) => {
      try {
        if (!this.session || !this.config) {
          return res.status(503).json({ error: 'Model or config not loaded' })
        }

        const { image } = req.body
        if (!image) {
          return res.status(400).json({ error: 'No image provided' })
        }

        const imageBuffer = Buffer.from(image, 'base64')
        const results = await this.runInference(imageBuffer)
        
        res.json({
          status: 'success',
          predictions: results,
          model_type: this.config.model_type
        })
      } catch (error: any) {
        console.error('Inference error:', error)
        res.status(500).json({ error: error.message || 'Inference failed' })
      }
    })
  }

  private async loadConfig(): Promise<InferenceConfig> {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Config not found: ${this.configPath}`)
    }
    
    const content = fs.readFileSync(this.configPath, 'utf-8')
    const config = yaml.load(content) as InferenceConfig
    
    if (!config.preprocess || !config.input) {
      throw new Error('Invalid config format: missing preprocess or input section')
    }
    
    return config
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<{ data: Float32Array; shape: number[] }> {
    if (!this.config) {
      throw new Error('Config not loaded')
    }

    const preprocess = this.config.preprocess
    
    const targetWidth = preprocess.resize.width
    const targetHeight = preprocess.resize.height
    
    let processedImage = sharp(imageBuffer)
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true })
    
    const { data, info } = await processedImage
    const { width, height, channels } = info
    
    const floatData = new Float32Array(width * height * channels)
    const mean = preprocess.normalize.mean
    const std = preprocess.normalize.std
    const scale = preprocess.scale
    
    const actualChannels = Math.min(channels, 3)
    
    for (let i = 0; i < data.length; i += channels) {
      for (let c = 0; c < actualChannels; c++) {
        let pixelValue = data[i + c]
        
        if (preprocess.to_rgb && channels === 3) {
          const rgbIndex = 2 - c
          pixelValue = data[i + rgbIndex]
        }
        
        pixelValue = pixelValue * scale
        pixelValue = (pixelValue - mean[c]) / std[c]
        
        const channelOffset = c * width * height
        const pixelOffset = Math.floor(i / channels)
        floatData[channelOffset + pixelOffset] = pixelValue
      }
    }
    
    const actualShape = [1, actualChannels, height, width]
    return { data: floatData, shape: actualShape }
  }

  private async runInference(imageBuffer: Buffer): Promise<InferenceResult[]> {
    if (!this.session || !this.config) {
      throw new Error('Model or config not loaded')
    }

    const { data: inputData, shape: inputShape } = await this.preprocessImage(imageBuffer)
    
    console.log(`[Inference] Input shape: ${JSON.stringify(inputShape)}, data length: ${inputData.length}`)
    console.log(`[Inference] Expected input name: ${this.config.input.name}`)
    console.log(`[Inference] Session input names: ${JSON.stringify(this.session.inputNames)}`)
    
    const tensor = new ort.Tensor('float32', inputData, inputShape)
    const feeds: Record<string, ort.Tensor> = {}
    feeds[this.config.input.name] = tensor

    const results = await this.session.run(feeds)
    
    console.log(`[Inference] Session output names: ${JSON.stringify(this.session.outputNames)}`)
    console.log(`[Inference] Expected output name: ${this.config.output.name}`)
    console.log(`[Inference] Results keys: ${JSON.stringify(Object.keys(results))}`)
    
    let output: ort.Tensor | undefined
    let outputName = this.config.output.name
    
    if (results[outputName]) {
      output = results[outputName] as ort.Tensor
    } else if (this.session.outputNames.length > 0) {
      outputName = this.session.outputNames[0]
      output = results[outputName] as ort.Tensor
      console.log(`[Inference] Using first output: ${outputName}`)
    }
    
    if (!output) {
      throw new Error(`Output tensor not found. Expected: ${this.config.output.name}, Available: ${Object.keys(results).join(', ')}`)
    }
    
    return this.postprocessOutput(output)
  }

  private postprocessOutput(output: ort.Tensor): InferenceResult[] {
    if (!this.config) {
      throw new Error('Config not loaded')
    }

    const outputData = output.data as Float32Array
    const predictions: InferenceResult[] = []
    
    if (this.config.model_type === 'anomaly_detection') {
      const score = outputData[0] || 0
      const threshold = this.config.postprocess.threshold
      
      predictions.push({
        label: 'anomaly',
        score: Math.max(0, Math.min(1, score)),
        is_anomaly: score > threshold
      })
      
      predictions.push({
        label: 'normal',
        score: Math.max(0, Math.min(1, 1 - score)),
        is_anomaly: score <= threshold
      })
    } else {
      for (let i = 0; i < this.labels.length && i < outputData.length; i++) {
        predictions.push({
          label: this.labels[i],
          score: Math.max(0, Math.min(1, outputData[i] || 0))
        })
      }
    }
    
    predictions.sort((a, b) => b.score - a.score)
    return predictions
  }

  async loadModel(): Promise<void> {
    try {
      if (!fs.existsSync(this.modelPath)) {
        throw new Error(`Model not found: ${this.modelPath}`)
      }
      
      this.config = await this.loadConfig()
      this.session = await ort.InferenceSession.create(this.modelPath)
      
      console.log(`[Inference Server] Model loaded from ${this.modelPath}`)
      console.log(`[Inference Server] Config loaded from ${this.configPath}`)
      console.log(`[Inference Server] Model type: ${this.config.model_type}`)
      console.log(`[Inference Server] Input names: ${this.session.inputNames}`)
      console.log(`[Inference Server] Output names: ${this.session.outputNames}`)
      
      const inputDetails = this.session.inputNames.map(name => {
        return { name, shape: this.config?.input.shape }
      })
      console.log(`[Inference Server] Input details: ${JSON.stringify(inputDetails)}`)
    } catch (error) {
      console.error('[Inference Server] Failed to load model:', error)
      throw error
    }
  }

  async start(): Promise<void> {
    await this.loadModel()
    
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[Inference Server] Running on port ${this.port}`)
        console.log(`[Inference Server] Labels: ${this.labels.join(', ')}`)
        resolve()
      })

      this.server.on('error', (err: any) => {
        console.error('[Inference Server] Failed to start:', err)
        reject(err)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log(`[Inference Server] Stopped on port ${this.port}`)
          resolve()
        })
      })
    }
  }
}

export { InferenceServer }
export type { InferenceConfig }
