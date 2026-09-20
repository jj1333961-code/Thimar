export type AntiCheatSeverity = 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'CHEATING_DETECTED'

export type AntiCheatConfig = {
  enabled: boolean
  requireCamera: boolean
  facePresence: boolean
  multipleFaces: boolean
  gaze: boolean
  headPose: boolean
  eyeClosure: boolean
  focus: boolean
  fullscreen: boolean
  singleTouch: boolean
  warningThreshold: number
  suspiciousThreshold: number
  cheatingThreshold: number
  graceMs: number
  blockMs: number
  autoRestore: boolean
  analysisIntervalMs: number
  sensitivity: 'low' | 'medium' | 'high'
}

export const defaultAntiCheatConfig: AntiCheatConfig = {
  enabled: false, requireCamera: true, facePresence: true, multipleFaces: true, gaze: true,
  headPose: true, eyeClosure: true, focus: true, fullscreen: false, singleTouch: true,
  warningThreshold: 20, suspiciousThreshold: 45, cheatingThreshold: 75, graceMs: 2500,
  blockMs: 8000, autoRestore: true, analysisIntervalMs: 150, sensitivity: 'medium',
}

export type Signal = { type: string; active: boolean; durationMs?: number; weight?: number; frequency?: number }

const signalWeights: Record<string, number> = {
  'face-missing': 28, 'multiple-faces': 42, 'gaze-away': 20, 'head-turn': 18,
  'eyes-closed': 16, 'page-hidden': 14, 'window-blur': 10, 'fullscreen-exit': 12,
  'touch-missing': 16, 'multiple-touch': 20,
}

export function normalizeServerConfig(value: unknown): AntiCheatConfig {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const sensitivity = input.sensitivity === 'low' || input.sensitivity === 'high' ? input.sensitivity : defaultAntiCheatConfig.sensitivity
  return {
    ...defaultAntiCheatConfig,
    ...input,
    enabled: Boolean(input.enabled),
    sensitivity,
    warningThreshold: Math.max(1, Math.min(100, Number(input.warningThreshold) || defaultAntiCheatConfig.warningThreshold)),
    suspiciousThreshold: Math.max(1, Math.min(100, Number(input.suspiciousThreshold) || defaultAntiCheatConfig.suspiciousThreshold)),
    cheatingThreshold: Math.max(1, Math.min(100, Number(input.cheatingThreshold) || defaultAntiCheatConfig.cheatingThreshold)),
    graceMs: Math.max(500, Math.min(60_000, Number(input.graceMs) || defaultAntiCheatConfig.graceMs)),
    blockMs: Math.max(1_000, Math.min(120_000, Number(input.blockMs) || defaultAntiCheatConfig.blockMs)),
    analysisIntervalMs: Math.max(100, Math.min(2_000, Number(input.analysisIntervalMs) || defaultAntiCheatConfig.analysisIntervalMs)),
  }
}

export function severityFor(score: number, config: AntiCheatConfig): AntiCheatSeverity {
  if (score >= config.cheatingThreshold) return 'CHEATING_DETECTED'
  if (score >= config.suspiciousThreshold) return 'SUSPICIOUS'
  if (score >= config.warningThreshold) return 'WARNING'
  return 'NORMAL'
}
export function calculateRiskScore(signals: Signal[], previous = 0) {
  const active = signals.filter((signal) => signal.active)
  const base = active.reduce((sum, signal) => {
    const weight = signal.weight ?? signalWeights[signal.type] ?? 10
    const durationFactor = Math.min(2.5, 1 + (signal.durationMs ?? 0) / 12_000)
    const frequencyFactor = Math.min(1.5, 1 + (signal.frequency ?? 0) / 5)
    return sum + weight * durationFactor * frequencyFactor
  }, 0)
  const distinct = new Set(active.map((signal) => signal.type)).size
  const compound = active.some((signal) => signal.type === 'face-missing') && active.some((signal) => signal.type === 'gaze-away' || signal.type === 'head-turn')
  const combinationBonus = compound ? 28 : distinct >= 3 ? 20 : distinct >= 2 ? 8 : 0
  // Keep sustained, independent signals meaningful while allowing a clean recovery.
  const persistence = Math.min(100, previous * 0.84)
  const corroborationBonus = distinct >= 4 ? 24 : distinct >= 3 ? 14 : distinct >= 2 ? 6 : 0
  return Math.max(0, Math.min(100, Math.round(persistence + base + combinationBonus + corroborationBonus)))
}
export function shouldRecord(signal: Signal, config: AntiCheatConfig) {
  return signal.active && (signal.durationMs ?? 0) >= config.graceMs
} 
export function isRecoverable(score: number, config: AntiCheatConfig) {
  return config.autoRestore && score < config.suspiciousThreshold
}
