// server-only — client officiel pour l'API Gateway Tranzak
import "server-only";
import { getTranzakConfig } from "./config";
import type {
  CreatePaymentParams,
  CreatePaymentResponse,
  GetPaymentResponse,
  VerifyPaymentResponse,
} from "./types";

export class TranzakApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorType?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "TranzakApiError";
  }
}

/**
 * Client pour la passerelle de paiement Tranzak.
 * Implémente rigoureusement la section 4 du guide.
 */
export class TranzakClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const config = getTranzakConfig();
    this.baseUrl = `${config.baseUrl}/api/gateway/v1`;
    this.apiKey = config.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set("X-Api-Key", this.apiKey);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      throw new TranzakApiError(
        "Erè rezo lè n ap kontakte passerelle Tranzak.",
        500,
        "network_error",
        err
      );
    }

    let body: Record<string, unknown> | null = null;
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        body = { raw: text };
      }
    }

    if (!response.ok) {
      const errorMessage =
        (typeof body?.message === "string" && body.message) ||
        (typeof body?.error === "string" && body.error) ||
        `Tranzak API Error: HTTP ${response.status}`;
      const errorType =
        (typeof body?.error === "string" && body.error) ||
        (typeof body?.code === "string" && body.code) ||
        "api_error";
      throw new TranzakApiError(
        errorMessage,
        response.status,
        errorType,
        body?.errors || body
      );
    }

    return body as T;
  }

  /**
   * Crée un paiement Tranzak (Section 4.1 du guide).
   * Retourne la réponse 201 contenant transaction_id et payment_url.
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    // Validation des montants minimaux (Section 5 du guide)
    if (params.payment_method === "moncash" && params.currency === "HTG" && params.amount < 10) {
      throw new TranzakApiError("Montan minimòm pou MonCash se 10 HTG.", 400, "amount_too_low");
    }
    if (params.payment_method === "natcash" && params.currency === "HTG" && params.amount < 20) {
      throw new TranzakApiError("Montan minimòm pou NatCash se 20 HTG.", 400, "amount_too_low");
    }
    if (params.payment_method === "card") {
      if (params.currency === "USD" && params.amount < 0.5) {
        throw new TranzakApiError("Montan minimòm pou kat se 0.50 USD.", 400, "amount_too_low");
      }
      if (params.currency === "HTG" && params.amount < 65) {
        throw new TranzakApiError("Montan minimòm pou kat se 65 HTG.", 400, "amount_too_low");
      }
    }

    return this.request<CreatePaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Lit le détail d'un paiement par transaction_id (Section 4.2).
   */
  async getPayment(transactionId: string): Promise<GetPaymentResponse> {
    return this.request<GetPaymentResponse>(`/payments/${encodeURIComponent(transactionId)}`, {
      method: "GET",
    });
  }

  /**
   * Lit le détail d'un paiement par référence marchand (Section 4.3).
   */
  async getPaymentByReference(reference: string): Promise<GetPaymentResponse> {
    return this.request<GetPaymentResponse>(
      `/payments/reference/${encodeURIComponent(reference)}`,
      { method: "GET" }
    );
  }

  /**
   * Vérifie activement l'état d'un paiement auprès de l'opérateur (Section 4.4).
   */
  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    return this.request<VerifyPaymentResponse>(
      `/payments/${encodeURIComponent(transactionId)}/verify`,
      { method: "POST" }
    );
  }
}
