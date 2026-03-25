import { Component, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AppToastService } from '../../services/toast/app-toast.service'
import { InputTextModule } from 'primeng/inputtext'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { ButtonThemeComponent } from '../../components/button-theme/button-theme.component'
import { AuthHeroCaptionComponent } from '../../components/auth-hero-caption/auth-hero-caption.component'
import { LoadingComponent } from '../../components/loading/loading.component'
import { UsersService } from '../../services/users/users.service'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, RippleModule, ButtonThemeComponent, AuthHeroCaptionComponent, LoadingComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private router = inject(Router)
  private usersService = inject(UsersService)
  private toast = inject(AppToastService)

  registerForm!: FormGroup
  isLoading = false
  isInvalid = false
  visiblePassword = false
  visibleConfirm = false

  ngOnInit() {
    this.registerForm = new FormGroup({
      fullName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    })
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.isInvalid = true
      this.toast.error('Incomplete form', 'Please fill in all fields correctly.')
      return
    }

    const { confirmPassword, ...data } = this.registerForm.value

    if (data.password !== confirmPassword) {
      this.toast.error('Passwords do not match', 'Enter the same password in both fields.')
      return
    }

    this.isLoading = true
    const success = await this.usersService.register(data)
    this.isLoading = false

    if (success) {
      this.router.navigate(['/signin'])
    } else {
      this.isInvalid = true
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  togglePassword() {
    this.visiblePassword = !this.visiblePassword
  }

  toggleConfirm() {
    this.visibleConfirm = !this.visibleConfirm
  }

  signinWithGoogle() {
    this.toast.info('Google sign-in', 'Google OAuth integration is not available yet.')
  }
}
