import { inject, Injectable } from '@angular/core'
import { HttpErrorResponse, HttpParams } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { ApiClientService } from '../../../global/services/api/api-client.service'
import { extractApiErrorMessage, isHandledByGlobalErrorInterceptor } from '../../../global/services/api/api-error'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import { IPayment, IPaymentCreateRequest, IPaymentHistoryFilters, IPaymentHistoryResult } from '../../interfaces/IPayment'

interface IApiEnvelope<T> {
  message?: string
  data?: T
}

interface IApiPayment {
  id?: number
  paymentId?: number
  subscriptionId?: number
  subscription_id?: number
  amount?: number
  paidAt?: string
  paid_at?: string
  paymentMethod?: string
  payment_method?: string
  reference?: string | null
  notes?: string | null
  createdAt?: string | null
  created_at?: string | null
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private api = inject(ApiClientService)
  private toast = inject(AppToastService)

  async getHistory(filters: IPaymentHistoryFilters): Promise<IPaymentHistoryResult> {
    try {
      const params = this.buildHistoryParams(filters)
      const response = await firstValueFrom(this.api.get<unknown>('/payments/history', { params }))
      return this.extractHistoryResponse(response)
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/payments/history')) {
        this.toast.error('Could not load payments', extractApiErrorMessage(error))
      }
      return {
        items: [],
        total: null
      }
    }
  }

  async getSubscriptionHistory(subscriptionId: number, limit = 30, offset = 0): Promise<IPayment[]> {
    try {
      const params = new HttpParams().set('limit', limit).set('offset', offset)
      const response = await firstValueFrom(this.api.get<unknown>(`/payments/subscriptions/${subscriptionId}`, { params }))
      const page = this.extractHistoryResponse(response)
      return page.items
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, `/payments/subscriptions/${subscriptionId}`)) {
        this.toast.error('Could not load payment history', extractApiErrorMessage(error))
      }
      return []
    }
  }

  async registerPayment(subscriptionId: number, payload: IPaymentCreateRequest): Promise<{ success: boolean; duplicate: boolean }> {
    try {
      const response = await firstValueFrom(this.api.post<IApiEnvelope<unknown>>(`/payments/subscriptions/${subscriptionId}`, payload))
      this.toast.success('Payment registered', response?.message || 'The payment was successfully registered.')
      return { success: true, duplicate: false }
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error)
      const isDuplicate = this.isDuplicateReferenceDate(error, errorMessage)

      if (isDuplicate) {
        this.toast.warn('Payment already registered', errorMessage)
        return { success: false, duplicate: true }
      }

      if (!isHandledByGlobalErrorInterceptor(error, `/payments/subscriptions/${subscriptionId}`)) {
        this.toast.error('Could not register payment', errorMessage)
      }
      return { success: false, duplicate: false }
    }
  }

  private buildHistoryParams(filters: IPaymentHistoryFilters) {
    let params = new HttpParams()

    if (typeof filters.subscriptionId === 'number') {
      params = params.set('subscriptionId', filters.subscriptionId)
    }

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate)
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate)
    }

    params = params.set('limit', filters.limit ?? 30)
    params = params.set('offset', filters.offset ?? 0)

    return params
  }

  private extractHistoryResponse(payload: unknown): IPaymentHistoryResult {
    const response = payload as {
      total?: number
      data?: {
        total?: number
        history?: IApiPayment[]
        items?: IApiPayment[]
        payments?: IApiPayment[]
      } | IApiPayment[]
      history?: IApiPayment[]
      items?: IApiPayment[]
      payments?: IApiPayment[]
    }

    const source = Array.isArray(payload)
      ? payload
      : Array.isArray(response?.data)
      ? response.data
      : response?.data && Array.isArray(response.data.history)
      ? response.data.history
      : response?.data && Array.isArray(response.data.items)
      ? response.data.items
      : response?.data && Array.isArray(response.data.payments)
      ? response.data.payments
      : Array.isArray(response?.history)
      ? response.history
      : Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response?.payments)
      ? response.payments
      : []

    const total = typeof response?.data === 'object' && response.data !== null && 'total' in response.data
      ? Number((response.data as { total?: number }).total ?? source.length)
      : typeof response?.total === 'number'
      ? Number(response.total)
      : null

    return {
      items: source
        .map((item) => this.normalizePayment(item as IApiPayment))
        .filter((item): item is IPayment => !!item),
      total
    }
  }

  private normalizePayment(item: IApiPayment): IPayment | null {
    const id = Number(item.id ?? item.paymentId ?? 0)
    const subscriptionId = Number(item.subscriptionId ?? item.subscription_id ?? 0)
    const paymentMethod = `${item.paymentMethod ?? item.payment_method ?? ''}`.trim()
    const paidAt = `${item.paidAt ?? item.paid_at ?? ''}`.trim()

    if (!id || !subscriptionId || !paymentMethod || !paidAt) {
      return null
    }

    return {
      id,
      subscriptionId,
      amount: Number(item.amount ?? 0),
      paidAt,
      paymentMethod,
      reference: item.reference ?? null,
      notes: item.notes ?? null,
      createdAt: item.createdAt ?? item.created_at ?? null
    }
  }

  private isDuplicateReferenceDate(error: unknown, message: string) {
    const status = (error as HttpErrorResponse)?.status
    const normalizedMessage = message.toLowerCase()

    return status === 400 && normalizedMessage.includes('already registered') && normalizedMessage.includes('reference date')
  }
}
