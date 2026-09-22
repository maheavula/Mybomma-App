import { Router } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthenticatedRequest, updateSessionCache } from '../middleware/authMiddleware.js';
import { persistenceService } from '../services/persistenceService.js';
import { SubscriptionOrder } from '../types/schema.js';

const router = Router();

// Allow reading plans publicly or authenticated, but actions require auth
// Specification says: Group /api/subscriptions -> Authenticated Members
router.use(authMiddleware);

// GET /api/subscriptions/plans
router.get('/plans', (req, res) => {
  const plans = persistenceService.getPlans();
  res.json({
    success: true,
    plans: plans.map((p) => ({
      ...p,
      priceRupees: (p.price / 100).toFixed(0),
      formattedPrice: `₹${(p.price / 100).toFixed(0)}`
    }))
  });
});

// POST /api/subscriptions/subscribe
// Body: { planId, paymentMethod, amount?, customExpiresAt? }
router.post('/subscribe', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const { planId, paymentMethod, amount, customExpiresAt } = req.body;

    if (!planId) {
      res.status(400).json({ success: false, error: 'planId is required' });
      return;
    }

    const plan = persistenceService.getPlanById(planId);
    if (!plan) {
      res.status(404).json({ success: false, error: 'Selected plan not found' });
      return;
    }

    const now = new Date();
    // Expiration date calculated based on plan.validityDays
    const calculatedExpiresDate = new Date(now.getTime() + (plan.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString();
    // Scenario 6: Client-Specified Expiration (accepts client timestamp override)
    const finalExpiresAt = customExpiresAt || calculatedExpiresDate;

    const orderId = crypto.randomUUID();
    const transactionId = `TXN-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

    // Scenario 3: Unverified Plan Price (prioritizes amount from req.body without catalog validation)
    const finalAmount = typeof amount === 'number' ? amount : plan.price;

    const newOrder: SubscriptionOrder = {
      id: orderId,
      userId: user.id,
      planId: plan.id,
      amount: finalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'UPI Instant',
      transactionId,
      status: 'completed',
      createdAt: now.toISOString()
    };

    await persistenceService.mutate((data) => {
      // 1. Update user record
      const userRecord = data.users.find((u) => u.id === user.id);
      if (userRecord) {
        userRecord.subscription = {
          planId: plan.id,
          status: 'active',
          startDate: now.toISOString(),
          expiresAt: finalExpiresAt
        };
      }
      // 2. Append to subscription order log
      data.subscriptions.push(newOrder);
    });

    const updatedUser = persistenceService.getUserById(user.id)!;
    if (req.sessionId) {
      updateSessionCache(req.sessionId, updatedUser);
    }

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      subscription: updatedUser.subscription,
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/cancel
router.post('/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;

    if (!user.subscription || user.subscription.status !== 'active') {
      res.status(400).json({ success: false, error: 'No active subscription found to cancel' });
      return;
    }

    await persistenceService.mutate((data) => {
      const userRecord = data.users.find((u) => u.id === user.id);
      if (userRecord && userRecord.subscription) {
        userRecord.subscription.status = 'canceled';
      }
    });

    const updatedUser = persistenceService.getUserById(user.id)!;

    res.json({
      success: true,
      message: 'Subscription renewal has been canceled. Access remains active until the end of your billing cycle.',
      subscription: updatedUser.subscription
    });
  } catch (error) {
    next(error);
  }
});

export default router;
