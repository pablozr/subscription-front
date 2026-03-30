import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { HeaderComponent } from '../../../global/components/header/header.component'
import { AppToastService } from '../../../global/services/toast/app-toast.service'
import { UsersService } from '../../../global/services/users/users.service'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private usersService = inject(UsersService)
  private toast = inject(AppToastService)

  profileForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(8)]),
    email: new FormControl('', [Validators.required, Validators.email])
  })

  loading = true
  saving = false

  ngOnInit() {
    this.loadProfile()
  }

  async loadProfile() {
    this.loading = true
    const profile = await this.usersService.getCurrentUser()
    this.loading = false

    if (!profile) {
      return
    }

    this.profileForm.patchValue({
      fullName: profile.fullName,
      email: profile.email
    })
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched()
      this.toast.error('Invalid form', 'Please check the highlighted fields before saving.')
      return
    }

    this.saving = true
    const payload = {
      email: `${this.profileForm.value.email ?? ''}`.trim(),
      fullName: `${this.profileForm.value.fullName ?? ''}`.trim().replace(/\s+/g, ' ')
    }

    const updated = await this.usersService.updateCurrentUser(payload)
    this.saving = false

    if (updated) {
      await this.loadProfile()
    }
  }

  isFieldInvalid(fieldName: string) {
    const control = this.profileForm.get(fieldName)
    return !!control && control.invalid && (control.touched || control.dirty)
  }

  getFieldError(fieldName: string) {
    const control = this.profileForm.get(fieldName)

    if (!control?.errors) {
      return ''
    }

    if (control.errors['required']) {
      return 'This field is required.'
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.'
    }

    if (control.errors['minlength']) {
      const required = control.errors['minlength'].requiredLength
      return `At least ${required} characters.`
    }

    return 'Invalid field.'
  }
}
