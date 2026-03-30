export interface ISubscription {
  id: number
  userId: number
  name: string
  price: number
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  status: 'ACTIVE' | 'CANCELED'
  startDate: string
  nextPaymentDate: string | null
  reminderDaysBefore: number
  canceledAt?: string | null
}

export interface ISubscriptionCreateRequest {
  name: string
  price: number
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  startDate: string
  reminderDaysBefore: number
}

export interface ISubscriptionUpdateRequest {
  name?: string
  price?: number
  billingCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  status?: 'ACTIVE' | 'CANCELED'
  nextPaymentDate?: string | null
  reminderDaysBefore?: number
}

export interface IBillingCycleOption {
  value: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  label: string
}

export interface ISubscriptionStatusOption {
  value: 'ACTIVE' | 'CANCELED'
  label: string
}
