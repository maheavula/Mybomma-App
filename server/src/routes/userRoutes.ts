import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { persistenceService } from '../services/persistenceService.js';
import { sanitizeUser } from './authRoutes.js';

const router = Router();

// Require auth for all user routes
router.use(authMiddleware);

// GET /api/user/profile
router.get('/profile', (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    success: true,
    profile: {
      ...sanitizeUser(user),
      registeredDate: user.createdAt,
      activePlanId: user.subscription?.planId || null,
      preferences: user.preferences || { defaultAudio: 'Telugu [Original]', autoPlayNext: true }
    }
  });
});

// PUT /api/user/profile
router.put('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;

    await persistenceService.mutate((data) => {
      const userIndex = data.users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        // Scenario 5: Unfiltered Property Merging
        data.users[userIndex] = {
          ...data.users[userIndex],
          ...req.body,
          id: user.id
        };
      }
    });

    const updatedUser = persistenceService.getUserById(user.id)!;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: sanitizeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/user/billing
router.get('/billing', (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const orders = persistenceService.getSubscriptionsForUser(user.id);
  const plans = persistenceService.getPlans();

  const billingHistory = orders.map((order) => {
    const plan = plans.find((p) => p.id === order.planId);
    return {
      id: order.id,
      transactionId: order.transactionId,
      planId: order.planId,
      planName: plan?.name || 'Subscription Plan',
      amountPaise: order.amount,
      amountRupees: (order.amount / 100).toFixed(2),
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: order.status,
      date: order.createdAt
    };
  });

  res.json({
    success: true,
    billing: {
      currentSubscription: user.subscription,
      orders: billingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  });
});

export default router;
