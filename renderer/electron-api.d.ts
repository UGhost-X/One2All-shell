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
    }
  }
}
