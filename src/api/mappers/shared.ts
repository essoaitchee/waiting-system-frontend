function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function unwrapPayload(payload: unknown): Record<string, unknown> {
  if (isRecord(payload)) {
    if (isRecord(payload.data)) {
      return payload.data
    }

    if (isRecord(payload.result)) {
      return payload.result
    }

    return payload
  }

  return {}
}

export function toArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (isRecord(payload)) {
    const candidates = [payload.items, payload.content, payload.data, payload.results]
    const matched = candidates.find(Array.isArray)
    return Array.isArray(matched) ? matched : []
  }

  return []
}

export function pickString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return null
}

export function pickNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value)
    }
  }

  return null
}
