import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { HeaderComponent } from '../../../global/components/header/header.component'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import { ISubscription } from '../../../subscriptions/interfaces/ISubscription'
import { SubscriptionsService } from '../../../subscriptions/services/subscriptions/subscriptions.service'
import { IPayment, IPaymentCreateRequest } from '../../interfaces/IPayment'
import { PaymentsService } from '../../services/payments/payments.service'

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, HeaderComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  private paymentsService = inject(PaymentsService)
  private subscriptionsService = inject(SubscriptionsService)
  private toast = inject(AppToastService)

  subscriptions: ISubscription[] = []
  payments: IPayment[] = []

  loading = true
  loadingSubscriptions = true
  submittingPayment = false

  limit = 30
  offset = 0
  totalPayments: number | null = null

  filterForm = new FormGroup({
    subscriptionId: new FormControl<number | null>(null),
    startDate: new FormControl(''),
    endDate: new FormControl('')
  })

  paymentForm = new FormGroup({
    subscriptionId: new FormControl<number | null>(null, [Validators.required]),
    amount: new FormControl<number | null>(null, [Validators.min(0.01)]),
    paidAt: new FormControl(''),
    paymentMethod: new FormControl('credit_card', [Validators.required]),
    reference: new FormControl(''),
    notes: new FormControl('')
  })

  ngOnInit() {
    this.loadSubscriptions()
    this.loadHistory()
  }

  async loadSubscriptions() {
    this.loadingSubscriptions = true
    this.subscriptions = await this.subscriptionsService.findAllSubscriptions()
    this.loadingSubscriptions = false
  }

  async loadHistory() {
    const startDate = this.filterForm.value.startDate || undefined
    const endDate = this.filterForm.value.endDate || undefined

    if (startDate && endDate && startDate > endDate) {
      this.toast.error('Invalid date range', 'Start date must be earlier than or equal to end date.')
      return
    }

    this.loading = true
    const subscriptionId = this.filterForm.value.subscriptionId ?? undefined
    const response = await this.paymentsService.getHistory({
      subscriptionId: typeof subscriptionId === 'number' ? subscriptionId : undefined,
      startDate,
      endDate,
      limit: this.limit,
      offset: this.offset
    })

    this.payments = response.items
    this.totalPayments = response.total
    this.loading = false
  }

  async applyFilters() {
    this.offset = 0
    await this.loadHistory()
  }

  async clearFilters() {
    this.filterForm.patchValue({
      subscriptionId: null,
      startDate: '',
      endDate: ''
    })
    this.offset = 0
    await this.loadHistory()
  }

  async onSubmitPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched()
      this.toast.error('Invalid form', 'Please fill all required fields correctly.')
      return
    }

    const subscriptionId = this.paymentForm.value.subscriptionId
    if (typeof subscriptionId !== 'number') {
      this.toast.error('Invalid subscription', 'Choose a valid subscription before submitting payment.')
      return
    }

    this.submittingPayment = true

    const payload = this.buildCreatePayload()
    const result = await this.paymentsService.registerPayment(subscriptionId, payload)

    this.submittingPayment = false

    if (result.success) {
      this.resetPaymentForm()
      await this.loadHistory()
    }
  }

  async previousPage() {
    if (this.offset === 0) {
      return
    }

    this.offset = Math.max(0, this.offset - this.limit)
    await this.loadHistory()
  }

  async nextPage() {
    if (!this.canGoNext) {
      return
    }

    this.offset += this.limit
    await this.loadHistory()
  }

  async setLimit(limit: number) {
    this.limit = limit
    this.offset = 0
    await this.loadHistory()
  }

  isFieldInvalid(fieldName: string) {
    const control = this.paymentForm.get(fieldName)
    return !!control && control.invalid && (control.touched || control.dirty)
  }

  getFieldError(fieldName: string) {
    const control = this.paymentForm.get(fieldName)

    if (!control?.errors) {
      return ''
    }

    if (control.errors['required']) {
      return 'This field is required.'
    }

    if (control.errors['min']) {
      return 'Enter a valid amount greater than zero.'
    }

    return 'Invalid field.'
  }

  get canGoNext() {
    if (typeof this.totalPayments === 'number') {
      return this.offset + this.limit < this.totalPayments
    }

    return this.payments.length >= this.limit
  }

  get pageRangeLabel() {
    if (!this.payments.length) {
      return 'No records'
    }

    const from = this.offset + 1
    const to = this.offset + this.payments.length

    if (typeof this.totalPayments === 'number') {
      return `${from}-${to} of ${this.totalPayments}`
    }

    return `${from}-${to}`
  }

  private buildCreatePayload(): IPaymentCreateRequest {
    const amountValue = this.paymentForm.value.amount
    const amount = typeof amountValue === 'number' && amountValue > 0 ? amountValue : undefined

    const paidAt = this.paymentForm.value.paidAt?.trim() || undefined
    const paymentMethod = this.paymentForm.value.paymentMethod?.trim() || 'credit_card'
    const reference = this.paymentForm.value.reference?.trim() || undefined
    const notes = this.paymentForm.value.notes?.trim() || undefined

    return {
      amount,
      paidAt,
      paymentMethod,
      reference,
      notes
    }
  }

  private resetPaymentForm() {
    this.paymentForm.patchValue({
      subscriptionId: null,
      amount: null,
      paidAt: '',
      paymentMethod: 'credit_card',
      reference: '',
      notes: ''
    })
    this.paymentForm.markAsPristine()
    this.paymentForm.markAsUntouched()
  }
}
