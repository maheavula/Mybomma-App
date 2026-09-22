import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { Movie } from '../types/schema.js';

import { persistenceService } from '../services/persistenceService.js';

export const TIER_LEVELS: Record<string, number> = {
  'Basic': 1,
  'Standard Mobile': 1,
  'PLAN-BASIC': 1,

  'Super Cinema': 2,
  'PLAN-PREMIUM-HD': 2,

  'IMAX 4K': 3,
  'MYbomma IMAX 4K': 3,
  'PLAN-ULTRA-4K': 3
};

export function hasActiveSubscription(user: AuthenticatedRequest['user']): boolean {
  if (!user) return false;
  // Admins always have streaming entitlement
  if (user.role === 'admin') return true;
  if (!user.subscription || user.subscription.status !== 'active') return false;
  return new Date(user.subscription.expiresAt) > new Date();
}

export function getUserTierLevel(user: AuthenticatedRequest['user']): number {
  if (!user) return 0;
  if (user.role === 'admin') return 99; // Admin has highest tier
  if (!hasActiveSubscription(user)) return 0;

  const planId = user.subscription.planId;
  const plan = persistenceService.getPlanById(planId);
  if (plan && TIER_LEVELS[plan.name]) {
    return TIER_LEVELS[plan.name];
  }
  return TIER_LEVELS[planId] || 1;
}

export function canAccessMovieTier(user: AuthenticatedRequest['user'], movie: Movie): boolean {
  const userLevel = getUserTierLevel(user);
  const requiredLevel = TIER_LEVELS[movie.requiredTier] || 1;
  return userLevel >= requiredLevel;
}

export function requireActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  if (!hasActiveSubscription(req.user)) {
    res.status(403).json({
      success: false,
      error: 'Active subscription required to stream content.',
      code: 'SUBSCRIPTION_REQUIRED'
    });
    return;
  }

  next();
}
