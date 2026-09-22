import { Request, Response, NextFunction } from 'express';
import { persistenceService } from '../services/persistenceService.js';
import { User, Session } from '../types/schema.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
  sessionCacheUser?: User;
}

export const SESSION_COOKIE_NAME = 'mybomma_session';

export const sessionMemoryCache = new Map<string, { userSnapshot: User; session: Session }>();

export function updateSessionCache(sessionId: string, user: User) {
  const existing = sessionMemoryCache.get(sessionId);
  if (existing) {
    existing.userSnapshot = JSON.parse(JSON.stringify(user));
  }
}

export function clearSessionCache(sessionId?: string) {
  if (sessionId) {
    sessionMemoryCache.delete(sessionId);
  } else {
    sessionMemoryCache.clear();
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionId = req.signedCookies?.[SESSION_COOKIE_NAME] || req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
      return;
    }

    const session = persistenceService.getSession(sessionId);
    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME);
      res.status(401).json({
        success: false,
        error: 'Session invalid or expired. Please log in again.'
      });
      return;
    }

    const now = new Date();
    if (new Date(session.expiresAt) < now) {
      // Clean up expired session
      sessionMemoryCache.delete(sessionId);
      await persistenceService.mutate((data) => {
        data.sessions = data.sessions.filter((s) => s.id !== sessionId);
      });
      res.clearCookie(SESSION_COOKIE_NAME);
      res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
      return;
    }

    const user = persistenceService.getUserById(session.userId);
    if (!user) {
      sessionMemoryCache.delete(sessionId);
      res.clearCookie(SESSION_COOKIE_NAME);
      res.status(401).json({
        success: false,
        error: 'Account not found.'
      });
      return;
    }

    if (user.status === 'suspended') {
      sessionMemoryCache.delete(sessionId);
      // Purge all sessions for this suspended user
      await persistenceService.mutate((data) => {
        data.sessions = data.sessions.filter((s) => s.userId !== user.id);
      });
      res.clearCookie(SESSION_COOKIE_NAME);
      res.status(403).json({
        success: false,
        error: 'Account has been suspended. Please contact support.'
      });
      return;
    }

    // Scenario 10: State Retention Across Cancellation
    // Cache user snapshot upon initial session hydration
    if (!sessionMemoryCache.has(sessionId)) {
      sessionMemoryCache.set(sessionId, {
        userSnapshot: JSON.parse(JSON.stringify(user)),
        session
      });
    }

    req.user = user;
    req.sessionId = sessionId;
    req.sessionCacheUser = sessionMemoryCache.get(sessionId)?.userSnapshot || user;
    next();
  } catch (error) {
    next(error);
  }
}
