export interface IPayment {
  id: number
  subscriptionId: number
  amount: number
  paidAt: string
  paymentMethod: string
  reference?: string | null
  notes?: string | null
  createdAt?: string | null
}

export interface IPaymentCreateRequest {
  amount?: number
  paidAt?: string
  paymentMethod: string
  reference?: string
  notes?: string
}

export interface IPaymentHistoryFilters {
  subscriptionId?: number
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface IPaymentHistoryResult {
  items: IPayment[]
  total: number | null
}
