import api from "./api";

export const createCheckoutSession = (data) =>
  api.post("/payments/stripe/checkout-session", data);

export const confirmCheckoutSession = (sessionId) =>
  api.post("/payments/confirm-checkout", { sessionId });

/** @deprecated Use createCheckoutSession */
export const createStripeCheckout = createCheckoutSession;

export const getSubscription = () => api.get("/payments/subscription");

/** @deprecated Use getSubscription */
export const getPaymentSubscription = getSubscription;

export const cancelSubscription = () => api.post("/payments/cancel");

/** @deprecated Use cancelSubscription */
export const cancelPaymentSubscription = cancelSubscription;
