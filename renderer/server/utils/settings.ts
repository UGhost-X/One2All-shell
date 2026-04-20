import path from 'path'
import { fileURLToPath } from 'url'

function getDirname(): string {
  try {
    const __filename = fileURLToPath(import.meta.url)
    return path.dirname(__filename)
  } catch {
    return process.cwd()
  }
}

let prisma: any = null

export async function getPrismaClient() {
  if (prisma) return prisma

  const isDev = process.env.NODE_ENV === 'development'
  const currentDir = getDirname()
  const dbPath = isDev
    ? path.join(currentDir, '../../../prisma/dev.db')
    : path.join(process.resourcesPath || currentDir, 'prisma/dev.db')

  const prismaGeneratedPath = isDev
    ? path.join(currentDir, '../../../prisma/generated/client')
    : path.join(process.resourcesPath || currentDir, 'prisma/generated/client')

  const { PrismaClient } = await import(prismaGeneratedPath)
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })

  return prisma
}

export interface AppSettings {
  dataPath: string
  locale: string
  backendMode: 'local' | 'remote'
  backendIp: string
  backendUrl: string
  backendPort: string
}

export async function getSettings(): Promise<AppSettings | null> {
  try {
    const prisma = await getPrismaClient()
    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 }
    })

    if (!settings) {
      return {
        dataPath: 'C:/Users/Public/One2All/Data',
        locale: 'zh',
        backendMode: 'local',
        backendIp: '127.0.0.1',
        backendUrl: 'http://127.0.0.1:8000',
        backendPort: '8000'
      }
    }

    return {
      dataPath: settings.dataPath,
      locale: settings.locale,
      backendMode: settings.backendMode as 'local' | 'remote',
      backendIp: settings.backendIp,
      backendUrl: settings.backendUrl,
      backendPort: settings.backendPort
    }
  } catch (error) {
    console.error('Failed to load settings from database:', error)
    return {
      dataPath: 'C:/Users/Public/One2All/Data',
      locale: 'zh',
      backendMode: 'local',
      backendIp: '127.0.0.1',
      backendUrl: 'http://127.0.0.1:8000',
      backendPort: '8000'
    }
  }
}

export function getPythonApiBase(settings: AppSettings): string {
  return settings.backendUrl
}

export function getInferenceHost(settings: AppSettings): string {
  if (settings.backendMode === 'local') {
    return '127.0.0.1'
  }
  try {
    const url = new URL(settings.backendUrl)
    return url.hostname
  } catch {
    return 'localhost'
  }
}
