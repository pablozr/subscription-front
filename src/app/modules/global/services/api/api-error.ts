import { PUBLIC_AUTH_PATHS } from '../http/public-auth-paths'

export function extractApiErrorMessage(error: unknown): string {
  const candidate = error as {
    error?: {
      detail?: string | { msg?: string }[]
      message?: string
    }
  }

  const detail = candidate?.error?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length) {
    const normalizedMessages = detail
      .map((item) => item?.msg)
      .filter((message): message is string => !!message && !!message.trim())

    if (normalizedMessages.length) {
      return normalizedMessages.join(' | ')
    }
  }

  const fallback = candidate?.error?.message
  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback
  }

  return 'Unexpected server error'
}

export function isHandledByGlobalErrorInterceptor(error: unknown, requestPath?: string): boolean {
  const status = (error as { status?: number })?.status

  if (status === 429 || status === 503) {
    return true
  }

  if (status === 401) {
    if (!requestPath) {
      return false
    }

    return !PUBLIC_AUTH_PATHS.some((path) => requestPath.includes(path))
  }

  return false
}
