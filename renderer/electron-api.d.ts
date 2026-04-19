export {}

declare global {
  interface Window {
    electronAPI?: {
      toggleAlwaysOnTop: () => Promise<boolean>
      isAlwaysOnTop: () => Promise<boolean>
      getProducts: () => Promise<any[]>
      addProduct: (product: any) => Promise<any>
      deleteProduct: (id: string) => Promise<void>
      getCameras: () => Promise<any[]>
      addCamera: (camera: any) => Promise<any>
      deleteCamera: (id: string) => Promise<void>
      updateCamera: (id: string, data: any) => Promise<any>
      getSystemCameras: () => Promise<Array<{ id: string; name: string; deviceId: string; isSystemCamera: boolean }>>
      // Network Camera API
      connectCamera: (cameraId: string, params?: { exposureTime?: number; gain?: number; offsetX?: number; offsetY?: number; width?: number; height?: number }) => Promise<{ success: boolean; message?: string; error?: string; status?: any }>
      disconnectCamera: (cameraId: string) => Promise<{ success: boolean; message?: string; error?: string }>
      captureFromCamera: (cameraId: string, savePath?: string) => Promise<{ success: boolean; data?: any; error?: string }>
      getCameraStatus: (cameraId: string) => Promise<{ success: boolean; status?: any; error?: string }>
      // Annotation Schemes
      getSchemes: () => Promise<any[]>
      saveScheme: (scheme: any) => Promise<any>
      deleteScheme: (id: string) => Promise<void>
      bindScheme: (productId: string, schemeId: string) => Promise<any>
      // Annotation Results
      getAnnotations: (productId: string, imagePath: string) => Promise<any>
      saveAnnotations: (productId: string, imagePath: string, data: string) => Promise<any>
      openFile: () => Promise<null | { path: string; data: string }>
      selectDirectory: () => Promise<string | null>
      getSettings: () => Promise<any>
      saveSettings: (settings: any) => Promise<any>
      saveImage: (data: { productId: string; fileName: string; dataUrl: string }) => Promise<string>
      loadImage: (path: string) => Promise<string | null>
      getProductImages: (productId: string) => Promise<string[]>
      saveDataset: (data: { productId: string; versionName: string; moduleName: string; images: any[]; cocoData: any }) => Promise<any>
      loadDataset: (params: { id?: string; savePath?: string }) => Promise<any>
      saveDatasetVersion: (data: any) => Promise<any>
      getDatasetVersions: (productId: string) => Promise<any[]>
      deleteDatasetVersion: (id: string) => Promise<any>
      saveTrainingRecord: (data: TrainingRecordData) => Promise<any>
      getTrainingRecords: (productId: string) => Promise<TrainingRecord[]>
      getTrainingRecord: (taskId: string, labelName?: string) => Promise<TrainingRecord | null>
      getTrainingRecordsByTaskUuid: (taskUuid: string) => Promise<TrainingRecord[]>
      deleteTrainingRecord: (taskId: string, labelName?: string) => Promise<any>
    }
  }
}

interface TrainingRecordData {
  productId: string
  taskId: string
  labelName?: string
  modelName?: string
  status?: string
  progress?: number
  totalEpochs?: number
  currentEpoch?: number
  batchSize?: number
  learningRate?: number
  metrics?: any[]
  logs?: string[]
  outputPath?: string
  startedAt?: Date
  completedAt?: Date
}

interface TrainingRecord extends TrainingRecordData {
  id: string
  taskUuid: string
  datasetVersionId?: string
  labelNames: string
  config: string
  latestIter?: number
  batchSize?: number
  learningRate?: number
  metrics?: string
  logs?: string
  startTime?: Date
  endTime?: Date
}
