import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ApiClientService } from '../../../global/services/api/api-client.service'
import { extractApiErrorMessage, isHandledByGlobalErrorInterceptor } from '../../../global/services/api/api-error'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import { ISubscription, ISubscriptionCreateRequest, ISubscriptionUpdateRequest } from '../../interfaces/ISubscription'

interface IApiEnvelope<T> {
  message?: string
  data?: T
}

interface ISubscriptionApi {
  id?: number
  user_id?: number
  userId?: number
  name?: string
  price?: number
  billing_cycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | string
  billingCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | string
  status?: 'ACTIVE' | 'CANCELED' | string
  start_date?: string
  startDate?: string
  next_payment_date?: string | null
  nextPaymentDate?: string | null
  reminder_days_before?: number
  reminderDaysBefore?: number
  canceled_at?: string | null
  canceledAt?: string | null
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private api = inject(ApiClientService)
  private toast = inject(AppToastService)

  async findAllSubscriptions(): Promise<ISubscription[]> {
    try {
      const response = await firstValueFrom(this.api.get<unknown>('/subscriptions'))
      return this.extractSubscriptions(response)
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/subscriptions')) {
        this.toast.error('Could not load subscriptions', extractApiErrorMessage(error))
      }
      return []
    }
  }

  async createSubscription(data: ISubscriptionCreateRequest): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.post<IApiEnvelope<unknown>>('/subscriptions', data))
      this.toast.success('Subscription created', response?.message || 'Your subscription was added successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/subscriptions')) {
        this.toast.error('Could not create subscription', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async updateSubscription(subscriptionId: number | string, data: ISubscriptionUpdateRequest): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.put<IApiEnvelope<unknown>>(`/subscriptions/${subscriptionId}`, data))
      this.toast.success('Subscription updated', response?.message || 'Changes were saved successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, `/subscriptions/${subscriptionId}`)) {
        this.toast.error('Could not update subscription', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async cancelSubscription(subscriptionId: number | string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.patch<IApiEnvelope<unknown>>(`/subscriptions/${subscriptionId}/cancel`, {}))
      this.toast.success('Subscription canceled', response?.message || 'The subscription was canceled successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, `/subscriptions/${subscriptionId}/cancel`)) {
        this.toast.error('Could not cancel subscription', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async deleteSubscription(subscriptionId: number | string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.delete<IApiEnvelope<unknown>>(`/subscriptions/${subscriptionId}`))
      this.toast.success('Subscription deleted', response?.message || 'The subscription was removed successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, `/subscriptions/${subscriptionId}`)) {
        this.toast.error('Could not delete subscription', extractApiErrorMessage(error))
      }
      return false
    }
  }

  private extractSubscriptions(payload: unknown): ISubscription[] {
    const response = payload as {
      data?: {
        subscriptions?: ISubscriptionApi[]
      } | ISubscriptionApi[]
    }

    const source = Array.isArray(payload)
      ? payload
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.subscriptions)
      ? response.data.subscriptions
      : []

    return source
      .map((item) => this.normalizeSubscription(item as ISubscriptionApi))
      .filter((item): item is ISubscription => !!item)
  }

  private normalizeSubscription(data: ISubscriptionApi): ISubscription | null {
    const id = Number(data?.id ?? 0)
    const userId = Number(data?.user_id ?? data?.userId ?? 0)
    const name = `${data?.name ?? ''}`.trim()
    const billingCycle = this.normalizeBillingCycle(data?.billingCycle ?? data?.billing_cycle)
    const status = this.normalizeStatus(data?.status)

    if (!id || !userId || !name || !billingCycle || !status) {
      return null
    }

    return {
      id,
      userId,
      name,
      price: Number(data?.price ?? 0),
      billingCycle,
      status,
      startDate: data?.startDate ?? data?.start_date ?? '',
      nextPaymentDate: data?.nextPaymentDate ?? data?.next_payment_date ?? null,
      reminderDaysBefore: Number(data?.reminderDaysBefore ?? data?.reminder_days_before ?? 0),
      canceledAt: data?.canceledAt ?? data?.canceled_at ?? null
    }
  }

  private normalizeBillingCycle(value: unknown): 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null {
    if (value === 'WEEKLY' || value === 'YEARLY' || value === 'MONTHLY') {
      return value
    }

    return null
  }

  private normalizeStatus(value: unknown): 'ACTIVE' | 'CANCELED' | null {
    if (value === 'ACTIVE' || value === 'CANCELED') {
      return value
    }

    return null
  }
}
