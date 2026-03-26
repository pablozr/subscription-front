import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import { ISubscription, ISubscriptionCreateRequest, ISubscriptionUpdateRequest } from '../../interfaces/ISubscription'

const API_URL = 'http://localhost:8000'

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private http = inject(HttpClient)
  private toast = inject(AppToastService)

  private endpoint = API_URL

  findAllSubscriptions() {
    return new Promise<ISubscription[]>((resolve) => {
      this.http.get<any>(`${this.endpoint}/subscriptions`, { withCredentials: true }).subscribe({
        next: (res) => {
          const source = Array.isArray(res)
            ? res
            : (res?.data?.subscriptions ?? res?.data ?? [])
          const data = Array.isArray(source) ? source.map((item) => this.normalizeSubscription(item)) : []
          resolve(data)
        },
        error: (err) => {
          this.toast.error('Could not load subscriptions', err.error?.detail || 'Please try again.')
          resolve([])
        }
      })
    })
  }

  createSubscription(data: ISubscriptionCreateRequest) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/subscriptions`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res) {
            this.toast.success('Subscription created', 'Your subscription was added successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not create subscription', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  updateSubscription(subscriptionId: number | string, data: ISubscriptionUpdateRequest) {
    return new Promise<boolean>((resolve) => {
      this.http.put<any>(`${this.endpoint}/subscriptions/${subscriptionId}`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res) {
            this.toast.success('Subscription updated', 'Changes were saved successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not update subscription', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  cancelSubscription(subscriptionId: number | string) {
    return new Promise<boolean>((resolve) => {
      this.http.patch<any>(`${this.endpoint}/subscriptions/${subscriptionId}/cancel`, {}, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res) {
            this.toast.success('Subscription canceled', 'The subscription was canceled successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not cancel subscription', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  deleteSubscription(subscriptionId: number | string) {
    return new Promise<boolean>((resolve) => {
      this.http.delete<any>(`${this.endpoint}/subscriptions/${subscriptionId}`, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res) {
            this.toast.success('Subscription deleted', 'The subscription was removed successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not delete subscription', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  private normalizeSubscription(data: any): ISubscription {
    return {
      id: data?.id ?? data?.subscriptionId ?? data?._id ?? 0,
      name: data?.name ?? 'Untitled subscription',
      price: Number(data?.price ?? 0),
      billingCycle: data?.billingCycle ?? data?.billing_cycle ?? 'MONTHLY',
      status: data?.status ?? 'ACTIVE',
      startDate: data?.startDate ?? data?.start_date ?? '',
      nextPaymentDate: data?.nextPaymentDate ?? data?.next_payment_date ?? null,
      reminderDaysBefore: Number(data?.reminderDaysBefore ?? data?.reminder_days_before ?? 0)
    }
  }
}
