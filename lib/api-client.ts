export class ApiRequestError extends Error {
  status: number
  retryable: boolean

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.retryable = status === 408 || status === 429 || status >= 500 || status === 0
  }
}

type RequestOptions = RequestInit & { retries?: number }

export async function requestJson<T>(input: RequestInfo | URL, options: RequestOptions = {}): Promise<T> {
  const { retries = 0, ...init } = options
  let attempt = 0
  while (true) {
    try {
      const response = await fetch(input, { ...init, headers: { accept: 'application/json', ...(init.headers ?? {}) } })
      const payload = await response.json().catch(() => ({})) as { error?: string; message?: string }
      if (!response.ok) throw new ApiRequestError(payload.error || payload.message || 'تعذر تنفيذ الطلب', response.status)
      return payload as T
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      if (!(error instanceof ApiRequestError) || !error.retryable || attempt >= retries) throw error
      attempt += 1
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt))
    }
  }
}
