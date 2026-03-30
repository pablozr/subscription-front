import { CommonModule } from '@angular/common'
import { Component, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MenuItem } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { FloatLabelModule } from 'primeng/floatlabel'
import { InputTextModule } from 'primeng/inputtext'
import { RippleModule } from 'primeng/ripple'
import { StepsModule } from 'primeng/steps'
import { ButtonThemeComponent } from '../../components/button-theme/button-theme.component'
import { LoadingComponent } from '../../components/loading/loading.component'
import { AppToastService } from '../../services/toast/app-toast.service'
import { UsersService } from './../../services/users/users.service'

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [StepsModule, ButtonModule, CardModule, ReactiveFormsModule, FormsModule, InputTextModule, FloatLabelModule, CommonModule, LoadingComponent, ButtonThemeComponent, RippleModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent implements OnInit {
  usersServices = inject(UsersService)

  private router = inject(Router)
  private toast = inject(AppToastService)

  isLoading = false
  isInvalidEmail = false
  isInvalidHash = false
  isInvalidNewPassword = false
  isInvalidPasswordConfirm = false

  items: MenuItem[] = []
  active = 0

  forgetPasswordEmailForm!: FormGroup
  forgetPasswordCodeForm!: FormGroup
  forgetPasswordNewPasswordForm!: FormGroup

  ngOnInit() {
    this.items = [
      {
        label: 'Email'
      },
      {
        label: 'Code'
      },
      {
        label: 'New Password'
      }
    ]

    this.forgetPasswordEmailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })

    this.forgetPasswordCodeForm = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    })

    this.forgetPasswordNewPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      passwordConfirm: new FormControl('', [Validators.required])
    })
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  async onSubmitEmail() {
    if (!this.forgetPasswordEmailForm.valid) {
      this.forgetPasswordEmailForm.markAllAsTouched()
      this.toast.error('Missing email', 'Fill in all required fields before continuing.')
      this.isInvalidEmail = true
      return
    }

    this.isLoading = true
    const email = `${this.forgetPasswordEmailForm.value.email ?? ''}`.trim()
    const validation = await this.usersServices.sendEmailForgetPassword({ email })
    this.isLoading = false

    if (validation) {
      this.active = 1
      this.isInvalidEmail = false
      return
    }

    this.isInvalidEmail = true
  }

  async onSubmitHashCode() {
    if (!this.forgetPasswordCodeForm.valid) {
      this.forgetPasswordCodeForm.markAllAsTouched()
      this.toast.error('Missing code', 'Fill in all required fields before continuing.')
      this.isInvalidHash = true
      return
    }

    this.isLoading = true
    const code = `${this.forgetPasswordCodeForm.value.code ?? ''}`.trim()
    const validation = await this.usersServices.validateCode({ code })
    this.isLoading = false

    if (validation) {
      this.active = 2
      this.isInvalidHash = false
      return
    }

    this.isInvalidHash = true
  }

  async onSubmitNewPassword() {
    if (!this.forgetPasswordNewPasswordForm.valid) {
      this.forgetPasswordNewPasswordForm.markAllAsTouched()
      this.toast.error('Incomplete data', 'Fill in all required fields before continuing.')
      this.isInvalidNewPassword = true
      this.isInvalidPasswordConfirm = true
      return
    }

    const { newPassword, passwordConfirm } = this.forgetPasswordNewPasswordForm.value
    if (newPassword !== passwordConfirm) {
      this.toast.error('Passwords do not match', 'Confirmation must match the new password.')
      this.isInvalidPasswordConfirm = true
      this.forgetPasswordNewPasswordForm.get('passwordConfirm')?.markAsTouched()
      return
    }

    this.isLoading = true
    const validation = await this.usersServices.updatePasswordWithoutOldPassword({
      password: `${newPassword ?? ''}`
    })
    this.isLoading = false

    if (validation) {
      this.isInvalidNewPassword = false
      this.isInvalidPasswordConfirm = false
      this.navigateTo('signin')
      return
    }

    this.isInvalidNewPassword = true
    this.isInvalidPasswordConfirm = true
  }

  isControlInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName)
    return !!control && control.invalid && (control.touched || control.dirty)
  }

  getControlError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName)

    if (!control?.errors) {
      return ''
    }

    if (control.errors['required']) {
      return 'This field is required.'
    }

    if (control.errors['email']) {
      return 'Informe um e-mail valido.'
    }

    if (control.errors['minlength']) {
      const required = control.errors['minlength'].requiredLength
      return `At least ${required} characters.`
    }

    if (control.errors['maxlength']) {
      const required = control.errors['maxlength'].requiredLength
      return `Up to ${required} characters.`
    }

    return 'Invalid field.'
  }

  get passwordsMismatch(): boolean {
    const password = this.forgetPasswordNewPasswordForm?.get('newPassword')?.value
    const confirmControl = this.forgetPasswordNewPasswordForm?.get('passwordConfirm')
    const confirmPassword = confirmControl?.value

    return !!password && !!confirmPassword && password !== confirmPassword && !!confirmControl && (confirmControl.touched || confirmControl.dirty)
  }
}
