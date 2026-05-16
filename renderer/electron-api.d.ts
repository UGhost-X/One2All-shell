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
      connectCamera: (cameraId: string, params?: { vendor?: string; exposureTime?: number; gain?: number; offsetX?: number; offsetY?: number; width?: number; height?: number }) => Promise<{ success: boolean; message?: string; error?: string; status?: any }>
      disconnectCamera: (cameraId: string) => Promise<{ success: boolean; message?: string; error?: string }>
      captureFromCamera: (cameraId: string, savePath?: string) => Promise<{ success: boolean; data?: any; error?: string }>
      getCameraStatus: (cameraId: string) => Promise<{ success: boolean; status?: any; error?: string }>
      updateCameraParameters: (cameraId: string, params: { exposureTime?: number; gain?: number; offsetX?: number; offsetY?: number }) => Promise<{ success: boolean; message?: string; error?: string; current_values?: any }>
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
      saveRoiImages: (data: { productId: string; taskUuid: string; images: Array<{ category: string; isAnomaly: boolean; modelIsAnomaly?: boolean; userIsAnomaly?: boolean; posId?: string; base64: string }>; mode?: string; requestTime?: string }) => Promise<{ success: boolean; rois?: Array<{ id?: string; filePath: string; roiType: string; mode: string }>; error?: string }>
      saveDatasetVersion: (data: any) => Promise<any>
      getDatasetVersions: (productId: string) => Promise<any[]>
      deleteDatasetVersion: (id: string) => Promise<any>
      saveTrainingRecord: (data: TrainingRecordData) => Promise<any>
      getTrainingRecords: (productId: string) => Promise<TrainingRecord[]>
      getTrainingRecord: (taskId: string, labelName?: string) => Promise<TrainingRecord | null>
      getTrainingRecordsByTaskUuid: (taskUuid: string) => Promise<TrainingRecord[]>
      deleteTrainingRecord: (taskId: string, labelName?: string) => Promise<any>
      // ROI Management
      updateRoiType: (data: { productId: string; taskUuid: string; category: string; fileName: string; userIsAnomaly: boolean }) => Promise<{ success: boolean; roiType?: string; error?: string }>
      getAvailableRois: (data: { productId: string; baseTaskUuid: string; roiType?: 'FP' | 'FN' }) => Promise<{ success: boolean; rois?: RoiImage[]; error?: string }>
      markRoisUsed: (data: { roiIds: string[]; usedTaskUuid: string }) => Promise<{ success: boolean; error?: string }>
      // Retrain Tasks - 使用 TrainingRecord
      createRetrainTask: (data: any) => Promise<{ success: boolean; task?: TrainingRecord; error?: string }>
      updateRetrainTask: (data: { taskId: string; status: string; message?: string }) => Promise<{ success: boolean; task?: TrainingRecord; error?: string }>
      getRetrainTasks: (data: { productId?: string; baseTaskUuid?: string }) => Promise<{ success: boolean; tasks?: TrainingRecord[]; error?: string }>
      getRetrainTask: (data: { taskUuid: string }) => Promise<{ success: boolean; task?: TrainingRecord; error?: string }>
    }
  }
}

interface RoiImage {
  id: string
  productId: string
  sourceTaskUuid: string
  category: string
  modelIsAnomaly: boolean
  userIsAnomaly: boolean
  roiType: 'FP' | 'FN' | 'NORMAL'
  filePath: string
  fileName: string
  thumbnailPath?: string
  posId?: string
  usedInRetrain: boolean
  usedTaskUuid?: string
  usedAt?: Date
  generation: number
  createdAt: Date
  updatedAt: Date
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
  // 重训相关字段
  isRetrain?: boolean
  baseTaskUuid?: string
  pathId?: string
  taskChain?: string
  generation?: number
  fpCount?: number
  fnCount?: number
  encoderName?: string
  decoderDepth?: number
  epochs?: number
  freezeEncoder?: boolean
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
  createdAt: Date
  updatedAt: Date
}
