import { AppState } from 'react-native';
import { api } from '@/api/client';
import type { AnalyticsEventPayload, AnalyticsEventType } from '@shopsphere/api-client';

/**
 * Storefront event tracking. Three rules this file exists to enforce:
 *
 * 1. Tracking never blocks or breaks a screen — every call is fire-and-forget
 *    and a failed flush is dropped, never retried into a loop or surfaced.
 * 2. Nothing identifying is sent. The session id is random per app run and
 *    means nothing outside this collection; the API attaches identity itself
 *    from the auth or guest token already on the request.
 * 3. Events are buffered, so a browsing burst costs one request rather than
 *    one per tap (the API accepts up to 50 per call).
 */

const MAX_BATCH = 50;
const FLUSH_DELAY_MS = 5000;

/** Random per app run. A new run is a new session, which is what "session" means here. */
const sessionId = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let buffer: AnalyticsEventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;

async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }
  if (buffer.length === 0) return;

  const batch = buffer.slice(0, MAX_BATCH);
  buffer = buffer.slice(MAX_BATCH);

  try {
    await api.analytics.recordEvents(batch);
  } catch {
    // Deliberately swallowed: losing analytics is always preferable to a
    // retry storm or an error surfacing in a shopping flow.
  }
}

export function track(type: AnalyticsEventType, fields: Omit<AnalyticsEventPayload, 'type' | 'sessionId'> = {}): void {
  buffer.push({ type, sessionId, occurredAt: new Date().toISOString(), ...fields });

  if (buffer.length >= MAX_BATCH) {
    void flush();
    return;
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => void flush(), FLUSH_DELAY_MS);
  }
}

/** Called once from the app root: opens the session and flushes whatever is pending when backgrounded. */
export function startAnalyticsSession(): () => void {
  track('session_start');

  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'background' || state === 'inactive') void flush();
  });

  return () => subscription.remove();
}
