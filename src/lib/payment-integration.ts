// Payment Integration System for Ummah Connects
// Handles both service bookings and product purchases

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay';
  name: string;
  isEnabled: boolean;
  processingFee: number; // Percentage
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: PaymentItem[];
  metadata: {
    type: 'service_booking' | 'product_purchase' | 'subscription';
    bookingId?: string;
    orderId?: string;
    serviceProviderId?: string;
  };
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  isService: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
}

export interface CommissionStructure {
  serviceBooking: {
    base: number; // 10%
    premium: number; // 15% for verified providers
    max: number; // 20%
  };
  productSales: {
    base: number; // 5%
    premium: number; // 8% for featured products
    max: number; // 12%
  };
  subscription: {
    monthly: number; // 3%
    yearly: number; // 2%
  };
}

// Payment Methods Configuration
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe_card',
    type: 'stripe',
    name: 'Credit/Debit Card',
    isEnabled: true,
    processingFee: 2.9,
    minAmount: 1
  },
  {
    id: 'paypal',
    type: 'paypal',
    name: 'PayPal',
    isEnabled: true,
    processingFee: 3.4,
    minAmount: 1
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    isEnabled: true,
    processingFee: 0,
    minAmount: 10
  },
  {
    id: 'apple_pay',
    type: 'apple_pay',
    name: 'Apple Pay',
    isEnabled: true,
    processingFee: 2.9,
    minAmount: 1
  },
  {
    id: 'google_pay',
    type: 'google_pay',
    name: 'Google Pay',
    isEnabled: true,
    processingFee: 2.9,
    minAmount: 1
  }
];

// Commission Structure
export const COMMISSION_STRUCTURE: CommissionStructure = {
  serviceBooking: {
    base: 0.10, // 10%
    premium: 0.15, // 15%
    max: 0.20 // 20%
  },
  productSales: {
    base: 0.05, // 5%
    premium: 0.08, // 8%
    max: 0.12 // 12%
  },
  subscription: {
    monthly: 0.03, // 3%
    yearly: 0.02 // 2%
  }
};

// Payment Service Class
export class PaymentService {
  private baseUrl: string;
  private apiKey: string;
  private stripePublishableKey: string;
  private paypalClientId: string;

  constructor(
    baseUrl: string,
    apiKey: string,
    stripePublishableKey: string,
    paypalClientId: string
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.stripePublishableKey = stripePublishableKey;
    this.paypalClientId = paypalClientId;
  }

  // Calculate commission based on transaction type and provider status
  calculateCommission(
    amount: number,
    type: 'service_booking' | 'product_sales' | 'subscription',
    isPremiumProvider: boolean = false,
    isFeaturedProduct: boolean = false
  ): number {
    let rate = 0;

    switch (type) {
      case 'service_booking':
        rate = isPremiumProvider ? COMMISSION_STRUCTURE.serviceBooking.premium : COMMISSION_STRUCTURE.serviceBooking.base;
        break;
      case 'product_sales':
        rate = isFeaturedProduct ? COMMISSION_STRUCTURE.productSales.premium : COMMISSION_STRUCTURE.productSales.base;
        break;
      case 'subscription':
        rate = COMMISSION_STRUCTURE.subscription.monthly; // Default to monthly
        break;
    }

    return amount * rate;
  }

  // Calculate processing fees
  calculateProcessingFees(amount: number, paymentMethod: PaymentMethod): number {
    return amount * (paymentMethod.processingFee / 100);
  }

  // Create payment intent
  async createPaymentIntent(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        throw new Error(`Payment intent creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        fees: {
          platform: 0,
          processing: 0,
          total: 0
        }
      };
    }
  }

  // Process payment with Stripe
  async processStripePayment(
    paymentRequest: PaymentRequest,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/stripe/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentRequest,
          paymentMethodId
        })
      });

      if (!response.ok) {
        throw new Error(`Stripe payment failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment failed',
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        fees: {
          platform: 0,
          processing: 0,
          total: 0
        }
      };
    }
  }

  // Process payment with PayPal
  async processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/paypal/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        throw new Error(`PayPal payment failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayPal payment failed',
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        fees: {
          platform: 0,
          processing: 0,
          total: 0
        }
      };
    }
  }

  // Get payment status
  async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/${transactionId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`Refund failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
        status: 'failed',
        amount: 0,
        currency: 'USD',
        fees: {
          platform: 0,
          processing: 0,
          total: 0
        }
      };
    }
  }

  // Get available payment methods for amount
  getAvailablePaymentMethods(amount: number): PaymentMethod[] {
    return PAYMENT_METHODS.filter(method => {
      if (!method.isEnabled) return false;
      if (method.minAmount && amount < method.minAmount) return false;
      if (method.maxAmount && amount > method.maxAmount) return false;
      return true;
    });
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }
}

// Initialize payment service
export const paymentService = new PaymentService(
  process.env.VITE_API_BASE_URL || 'https://api.ummahconnects.com',
  process.env.VITE_API_KEY || '',
  process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  process.env.VITE_PAYPAL_CLIENT_ID || ''
);

// Utility functions
export const createServiceBookingPayment = (
  serviceProviderId: string,
  serviceId: string,
  amount: number,
  currency: string,
  customer: PaymentRequest['customer']
): PaymentRequest => ({
  id: `booking_${Date.now()}`,
  amount,
  currency,
  description: `Service booking payment`,
  customer,
  items: [{
    id: serviceId,
    name: 'Service Booking',
    description: 'Islamic service booking',
    quantity: 1,
    price: amount,
    category: 'service',
    isService: true
  }],
  metadata: {
    type: 'service_booking',
    serviceProviderId
  },
  successUrl: `${window.location.origin}/booking/success`,
  cancelUrl: `${window.location.origin}/booking/cancel`
});

export const createProductPurchasePayment = (
  products: Array<{ id: string; name: string; price: number; quantity: number }>,
  customer: PaymentRequest['customer']
): PaymentRequest => {
  const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  
  return {
    id: `purchase_${Date.now()}`,
    amount: totalAmount,
    currency: 'USD',
    description: `Product purchase`,
    customer,
    items: products.map(product => ({
      id: product.id,
      name: product.name,
      description: 'Islamic product',
      quantity: product.quantity,
      price: product.price,
      category: 'product',
      isService: false
    })),
    metadata: {
      type: 'product_purchase'
    },
    successUrl: `${window.location.origin}/shop/success`,
    cancelUrl: `${window.location.origin}/shop/cancel`
  };
};







