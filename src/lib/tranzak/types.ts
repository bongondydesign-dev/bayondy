// ============================================================
// src/lib/tranzak/types.ts
// Types officiels de la passerelle de paiement Tranzak
// Source de vérité : https://dashboard.tranzak.co/ai
// ============================================================

export type TranzakPaymentMethod = "moncash" | "natcash" | "card";

export type TranzakPaymentStatus = "pending" | "processing" | "completed" | "failed";

export interface TranzakConversion {
  original_amount: number;
  original_currency: string;
  exchange_rate: number;
  charged_amount: number;
  charged_currency: string;
}

export interface CreatePaymentParams {
  amount: number;
  currency: "HTG" | "USD";
  payment_method: TranzakPaymentMethod;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  reference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Réponse 201 de POST /api/gateway/v1/payments (au niveau racine, non enveloppée dans data) */
export interface CreatePaymentResponse {
  success: boolean;
  transaction_id: string;
  amount: string;
  currency: string;
  status: TranzakPaymentStatus;
  created_at: string;
  payment_url?: string;
  client_secret?: string;
  publishable_key?: string;
  payment_intent_id?: string;
  conversion?: TranzakConversion;
  test_mode?: boolean;
  simulated?: boolean;
}

export interface TranzakCustomer {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface TranzakPaymentData {
  transaction_id: string;
  amount: string;
  currency: string;
  status: TranzakPaymentStatus;
  payment_method: TranzakPaymentMethod;
  reference: string | null;
  description: string | null;
  customer: TranzakCustomer;
  created_at: string;
  completed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown> | null;
}

/** Réponse de GET /api/gateway/v1/payments/{id} ou reference/{ref} (enveloppée dans data) */
export interface GetPaymentResponse {
  success: boolean;
  data: TranzakPaymentData;
}

/** Réponse de POST /api/gateway/v1/payments/{id}/verify */
export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    transaction_id: string;
    status: TranzakPaymentStatus;
    verified_at: string;
    provider_response?: unknown;
  };
}

/** Corps du webhook Tranzak (POST JSON) */
export interface TranzakWebhookPayload {
  event: "payment.success" | "payment.failed";
  timestamp: number;
  data: TranzakPaymentData;
}
