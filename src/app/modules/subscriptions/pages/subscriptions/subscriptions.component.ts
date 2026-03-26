import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { SelectButtonModule } from 'primeng/selectbutton'
import { HeaderComponent } from '../../../global/components/header/header.component'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import {
  IBillingCycleOption,
  ISubscription,
  ISubscriptionCreateRequest,
  ISubscriptionStatusOption,
  ISubscriptionUpdateRequest
} from '../../interfaces/ISubscription'
import { SubscriptionsService } from '../../services/subscriptions/subscriptions.service'

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    SelectButtonModule,
    HeaderComponent
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  private subscriptionsService = inject(SubscriptionsService)
  private toast = inject(AppToastService)

  subscriptionForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    billingCycle: new FormControl('MONTHLY', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    reminderDaysBefore: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    status: new FormControl('ACTIVE'),
    nextPaymentDate: new FormControl('')
  })

  billingCycleOptions: IBillingCycleOption[] = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'YEARLY', label: 'Anual' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'QUARTERLY', label: 'Trimestral' }
  ]

  statusOptions: ISubscriptionStatusOption[] = [
    { value: 'ACTIVE', label: 'Ativa' },
    { value: 'CANCELED', label: 'Cancelada' }
  ]

  statusFilterOptions = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Ativas', value: 'ACTIVE' },
    { label: 'Canceladas', value: 'CANCELED' }
  ]

  subscriptions: ISubscription[] = []
  searchTerm = ''
  statusFilter = 'ALL'
  loading = true
  submitLoading = false
  deleteLoading = false
  formDialogVisible = false
  deleteDialogVisible = false
  editingSubscription: ISubscription | null = null
  deletingSubscription: ISubscription | null = null

  ngOnInit() {
    this.loadSubscriptions()
  }

  async loadSubscriptions() {
    this.loading = true
    this.subscriptions = await this.subscriptionsService.findAllSubscriptions()
    this.loading = false
  }

  async onSubmit() {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched()
      this.toast.error('Formulario invalido', 'Preencha os campos obrigatorios corretamente.')
      return
    }

    this.submitLoading = true
    const response = this.editingSubscription
      ? await this.updateSubscription(this.editingSubscription)
      : await this.createSubscription()

    this.submitLoading = false

    if (!response) {
      return
    }

    this.closeFormDialog()

    await this.loadSubscriptions()
  }

  openCreateDialog() {
    this.formDialogVisible = true
    this.editingSubscription = null
    this.subscriptionForm.patchValue({
      name: '',
      price: null,
      billingCycle: 'MONTHLY',
      startDate: '',
      reminderDaysBefore: 0,
      status: 'ACTIVE',
      nextPaymentDate: ''
    })
  }

  startEdit(subscription: ISubscription) {
    this.formDialogVisible = true
    this.editingSubscription = subscription

    this.subscriptionForm.patchValue({
      name: subscription.name,
      price: subscription.price,
      billingCycle: subscription.billingCycle,
      startDate: this.toDateInput(subscription.startDate),
      reminderDaysBefore: subscription.reminderDaysBefore,
      status: subscription.status,
      nextPaymentDate: this.toDateInput(subscription.nextPaymentDate)
    })
  }

  closeFormDialog() {
    this.formDialogVisible = false
    this.editingSubscription = null
    this.submitLoading = false
    this.subscriptionForm.patchValue({
      name: '',
      price: null,
      billingCycle: 'MONTHLY',
      startDate: '',
      reminderDaysBefore: 0,
      status: 'ACTIVE',
      nextPaymentDate: ''
    })
  }

  async toggleStatus(subscription: ISubscription) {
    const success = subscription.status === 'ACTIVE'
      ? await this.subscriptionsService.cancelSubscription(subscription.id)
      : await this.subscriptionsService.updateSubscription(subscription.id, { status: 'ACTIVE' })

    if (success) {
      await this.loadSubscriptions()
    }
  }

  openDeleteDialog(subscription: ISubscription) {
    this.deletingSubscription = subscription
    this.deleteDialogVisible = true
  }

  closeDeleteDialog() {
    this.deletingSubscription = null
    this.deleteDialogVisible = false
    this.deleteLoading = false
  }

  async confirmDelete() {
    if (!this.deletingSubscription) {
      return
    }

    this.deleteLoading = true
    const success = await this.subscriptionsService.deleteSubscription(this.deletingSubscription.id)
    this.deleteLoading = false

    if (!success) {
      return
    }

    this.closeDeleteDialog()
    await this.loadSubscriptions()
  }

  get pageButtonLabel() {
    if (this.submitLoading) {
      return 'Salvando...'
    }

    return this.editingSubscription ? 'Salvar alteracoes' : 'Adicionar inscricao'
  }

  get totalActiveSubscriptions() {
    return this.subscriptions.filter((item) => item.status === 'ACTIVE').length
  }

  get totalMonthlyProjection() {
    const total = this.subscriptions
      .filter((item) => item.status === 'ACTIVE')
      .reduce((acc, item) => acc + this.toMonthlyProjection(item), 0)

    return Number(total.toFixed(2))
  }

  get filteredSubscriptions() {
    const normalizedSearch = this.searchTerm.trim().toLowerCase()

    return this.subscriptions.filter((item) => {
      const matchesSearch = !normalizedSearch
        || item.name.toLowerCase().includes(normalizedSearch)
        || item.billingCycle.toLowerCase().includes(normalizedSearch)

      const matchesStatus = this.statusFilter === 'ALL' || item.status === this.statusFilter

      return matchesSearch && matchesStatus
    })
  }

  get hasAnyFilter() {
    return !!this.searchTerm.trim() || this.statusFilter !== 'ALL'
  }

  get formDialogTitle() {
    return this.editingSubscription ? 'Editar inscricao' : 'Nova inscricao'
  }

  clearFilters() {
    this.searchTerm = ''
    this.statusFilter = 'ALL'
  }

  isFieldInvalid(fieldName: string) {
    const control = this.subscriptionForm.get(fieldName)
    return !!control && control.invalid && (control.touched || control.dirty)
  }

  getFieldError(fieldName: string) {
    const control = this.subscriptionForm.get(fieldName)

    if (!control?.errors) {
      return ''
    }

    if (control.errors['required']) {
      return 'Este campo e obrigatorio.'
    }

    if (control.errors['min']) {
      return 'Informe um valor valido.'
    }

    return 'Campo invalido.'
  }

  private async createSubscription() {
    const payload = this.buildCreatePayload()
    return this.subscriptionsService.createSubscription(payload)
  }

  private async updateSubscription(subscription: ISubscription) {
    const payload = this.buildUpdatePayload(subscription)

    if (!Object.keys(payload).length) {
      this.toast.info('Nenhuma alteracao detectada', 'Ajuste um campo para salvar alteracoes.')
      return false
    }

    return this.subscriptionsService.updateSubscription(subscription.id, payload)
  }

  private buildCreatePayload(): ISubscriptionCreateRequest {
    return {
      name: this.subscriptionForm.value.name?.trim() || '',
      price: Number(this.subscriptionForm.value.price),
      billingCycle: this.subscriptionForm.value.billingCycle || 'MONTHLY',
      startDate: this.subscriptionForm.value.startDate || '',
      reminderDaysBefore: Number(this.subscriptionForm.value.reminderDaysBefore ?? 0)
    }
  }

  private buildUpdatePayload(original: ISubscription): ISubscriptionUpdateRequest {
    const payload: ISubscriptionUpdateRequest = {}
    const formValue = this.subscriptionForm.value

    const name = formValue.name?.trim() || ''
    const price = Number(formValue.price)
    const billingCycle = formValue.billingCycle || 'MONTHLY'
    const status = formValue.status || 'ACTIVE'
    const reminderDaysBefore = Number(formValue.reminderDaysBefore ?? 0)
    const nextPaymentDate = formValue.nextPaymentDate || ''

    if (name && name !== original.name) payload.name = name
    if (!Number.isNaN(price) && price > 0 && price !== original.price) payload.price = price
    if (billingCycle !== original.billingCycle) payload.billingCycle = billingCycle
    if (status !== original.status) payload.status = status
    if (reminderDaysBefore !== original.reminderDaysBefore) payload.reminderDaysBefore = reminderDaysBefore

    if (nextPaymentDate !== this.toDateInput(original.nextPaymentDate)) {
      payload.nextPaymentDate = nextPaymentDate || null
    }

    return payload
  }

  private toDateInput(value: string | null) {
    if (!value) {
      return ''
    }

    return value.length >= 10 ? value.slice(0, 10) : value
  }

  private toMonthlyProjection(subscription: ISubscription) {
    if (subscription.billingCycle === 'YEARLY') {
      return subscription.price / 12
    }

    if (subscription.billingCycle === 'QUARTERLY') {
      return subscription.price / 3
    }

    if (subscription.billingCycle === 'WEEKLY') {
      return subscription.price * 4.33
    }

    return subscription.price
  }
}
