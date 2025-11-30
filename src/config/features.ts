import { logger } from '../lib/logger'
import { config } from './env'

interface Flags {
  modules?: Record<string, boolean>
  features?: Record<string, Record<string, boolean>>
}

let parsed: Flags | null = null
const parse = (): Flags => {
  if (parsed) return parsed
  try {
    parsed = JSON.parse(config.featureFlagsJson) as Flags
  } catch (err) {
    logger.warn({ err }, 'Invalid FEATURE_FLAGS')
    parsed = {}
  }
  return parsed
}

export const isModuleEnabled = (name: string) => {
  const f = parse()
  if (!f.modules) return true
  const v = f.modules[name]
  return v !== undefined ? v : true
}

export const isFeatureEnabled = (m: string, f: string) => {
  const parsedFlags = parse()
  if (!parsedFlags.features) return true
  const mf = parsedFlags.features[m]
  if (!mf) return true
  const v = mf[f]
  return v !== undefined ? v : true
}
