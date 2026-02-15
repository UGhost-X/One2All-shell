export {}

declare global {
  interface Window {
    electronAPI?: {
      toggleAlwaysOnTop: () => Promise<boolean>
      isAlwaysOnTop: () => Promise<boolean>
      getProducts: () => Promise<any[]>
      addProduct: (product: any) => Promise<any>
      deleteProduct: (id: number) => Promise<void>
      getCameras: () => Promise<any[]>
      addCamera: (camera: any) => Promise<any>
      deleteCamera: (id: number) => Promise<void>
      updateCamera: (id: number, data: any) => Promise<any>
      // Annotation Schemes
      getSchemes: () => Promise<any[]>
      saveScheme: (scheme: any) => Promise<any>
      deleteScheme: (id: number) => Promise<void>
      bindScheme: (productId: number, schemeId: number) => Promise<any>
      // Annotation Results
      getAnnotations: (productId: number, imagePath: string) => Promise<any>
      saveAnnotations: (productId: number, imagePath: string, data: string) => Promise<any>
      openFile: () => Promise<null | { path: string; data: string }>
      selectDirectory: () => Promise<string | null>
      getSettings: () => Promise<any>
      saveSettings: (settings: any) => Promise<any>
      saveImage: (data: { productId: number; fileName: string; dataUrl: string }) => Promise<string>
      loadImage: (path: string) => Promise<string | null>
      getProductImages: (productId: number) => Promise<string[]>
      saveDataset: (data: { productId: number; versionName: string; moduleName: string; images: any[]; cocoData: any }) => Promise<any>
      loadDataset: (params: { id?: number | string; savePath?: string }) => Promise<any>
      saveDatasetVersion: (data: any) => Promise<any>
      getDatasetVersions: (productId: number) => Promise<any[]>
      deleteDatasetVersion: (id: number | string) => Promise<any>
      saveTrainingRecord: (data: TrainingRecordData) => Promise<any>
      getTrainingRecords: (productId: number) => Promise<TrainingRecord[]>
      getTrainingRecord: (taskId: string) => Promise<TrainingRecord | null>
      deleteTrainingRecord: (taskId: string) => Promise<any>
    }
  }
}

interface TrainingRecordData {
  productId: number
  taskId: string
  labelName?: string
  modelName?: string
  status?: string
  progress?: number
  totalEpochs?: number
  currentEpoch?: number
  outputPath?: string
  startedAt?: Date
  completedAt?: Date
}

interface TrainingRecord extends TrainingRecordData {
  id: number
  taskUuid: string
  datasetVersionId?: number
  labelNames: string
  config: string
  latestIter?: number
  startTime?: Date
  endTime?: Date
  hasBestModel: boolean
  logPath?: string
  createdAt: Date
  updatedAt: Date
}
