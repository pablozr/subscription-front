import { Component, OnInit, inject } from '@angular/core'
import { InputTextModule } from 'primeng/inputtext'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AppToastService } from '../../services/toast/app-toast.service'
import { ButtonThemeComponent } from '../../components/button-theme/button-theme.component'
import { AuthHeroCaptionComponent } from '../../components/auth-hero-caption/auth-hero-caption.component'
import { LoadingComponent } from '../../components/loading/loading.component'
import { UsersService } from '../../services/users/users.service'
import { RippleModule } from 'primeng/ripple'

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [InputTextModule, ButtonModule, CommonModule, ReactiveFormsModule, LoadingComponent, ButtonThemeComponent, AuthHeroCaptionComponent, RippleModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent implements OnInit {
  private router = inject(Router)
  usersServices = inject(UsersService)
  private toast = inject(AppToastService)

  isLoading = false
  loginForm!: FormGroup
  isInvalid = false
  visiblePassword = false

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.toast.error('Incomplete form', 'Enter a valid email and password.')
      return
    }
    this.isLoading = true
    const response = await this.usersServices.signin(this.loginForm.value)
    this.isInvalid = true
    this.isLoading = false

    if (response) {
      this.isInvalid = false
      this.router.navigate(['/home'])
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route])
  }

  togglePassword() {
    this.visiblePassword = !this.visiblePassword
  }

  signinWithGoogle() {
    this.toast.info('Google sign-in', 'Google OAuth integration is not available yet.')
  }
}
