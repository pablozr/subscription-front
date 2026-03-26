export interface ISubscription {
  id: number | string
  name: string
  price: number
  billingCycle: string
  status: string
  startDate: string
  nextPaymentDate: string | null
  reminderDaysBefore: number
}

export interface ISubscriptionCreateRequest {
  name: string
  price: number
  billingCycle: string
  startDate: string
  reminderDaysBefore: number
}

export interface ISubscriptionUpdateRequest {
  name?: string
  price?: number
  billingCycle?: string
  status?: string
  nextPaymentDate?: string | null
  reminderDaysBefore?: number
}

export interface IBillingCycleOption {
  value: string
  label: string
}

export interface ISubscriptionStatusOption {
  value: string
  label: string
}
