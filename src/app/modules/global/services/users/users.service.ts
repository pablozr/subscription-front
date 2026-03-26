import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AppToastService } from '../toast/app-toast.service'
import { BehaviorSubject } from 'rxjs'
import { Router } from '@angular/router'
import { IRegisterRequest, ISigninData, ISigninRequest } from '../../interfaces/ISignin'
import { IUser } from '../../interfaces/IUser'
import { StorageService } from '../local-storage/storage.service'

const API_URL = 'http://localhost:8000'

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient)
  private toast = inject(AppToastService)
  private storageService = inject(StorageService)
  private router = inject(Router)

  private endpoint: string = API_URL

  private userSubject = new BehaviorSubject<ISigninData | null>(null)
  user$ = this.userSubject.asObservable()

  get currentUser(): ISigninData | null {
    return this.userSubject.value
  }

  // Auth

  signin(data: ISigninRequest) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/auth/login`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          const userData = this.extractUserData(res)

          if (!userData) {
            this.toast.error('Sign-in failed', 'Could not read user profile from the server response.')
            resolve(false)
            return
          }

          this.userSubject.next(userData)
          resolve(true)
        },
        error: (err) => {
          this.toast.error('Sign-in failed', err.error?.detail || 'Invalid credentials.')
          resolve(false)
        }
      })
    })
  }

  register(data: IRegisterRequest) {
    const payload = this.buildRegisterPayload(data)
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/users`, payload, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('Account created', 'Your account was created successfully.')
          }
          resolve(true)
        },
        error: (err) => {
          this.toast.error('Could not create account', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  private buildRegisterPayload(data: IRegisterRequest) {
    const fullName = data.fullName.trim().replace(/\s+/g, ' ')
    return {
      fullName,
      email: data.email.trim(),
      password: data.password
    }
  }

  logout() {
    return new Promise<boolean>((resolve) => {
      this.http.post(`${this.endpoint}/auth/logout`, {}, { withCredentials: true }).subscribe({
        next: () => {
          this.userSubject.next(null)
          this.storageService.deleteLocalStorage('USER-BASIC-TEMPLATE')
          this.router.navigate(['/signin'])
          resolve(true)
        },
        error: () => {
          this.userSubject.next(null)
          this.storageService.deleteLocalStorage('USER-BASIC-TEMPLATE')
          this.router.navigate(['/signin'])
          resolve(false)
        }
      })
    })
  }

  rehydrateSession() {
    return new Promise<boolean>((resolve) => {
      this.http.get<any>(`${this.endpoint}/users/me`, { withCredentials: true }).subscribe({
        next: (res) => {
          const userData = this.extractUserData(res)

          if (!userData) {
            resolve(false)
            return
          }

          this.userSubject.next(userData)
          resolve(true)
        },
        error: () => {
          resolve(false)
        }
      })
    })
  }

  // Forget password flow

  sendEmailForgetPassword(data: any) {
    return new Promise<any>((resolve) => {
      this.http.post<any>(`${this.endpoint}/auth/forget-password`, data).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('Email sent', res.message)
          }
          resolve(res)
        },
        error: (err) => {
          this.toast.error('Could not send email', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  validateHashCode(data: any) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/auth/validate-code`, data).subscribe({
        next: (res) => {
          if (res?.validated || res?.isValid || res?.userId || res?.message) {
            this.toast.success('Code validated', 'Your confirmation code is valid.')
            resolve(true)
          } else {
            this.toast.error('Invalid code', 'The code is invalid or expired.')
            resolve(false)
          }
        },
        error: (err) => {
          this.toast.error('Invalid code', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  editPasswordWithOutOldPassword(userId: string, data: any) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/auth/update-password`, { ...data, userId }).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('Password updated', 'Your password was reset successfully.')
            resolve(true)
          } else {
            this.toast.error('Could not update password', 'An error occurred while changing your password.')
            resolve(false)
          }
        },
        error: (err) => {
          this.toast.error('Could not update password', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  // Users CRUD

  findAllUsers() {
    return new Promise<IUser[]>((resolve) => {
      this.http.get<any>(`${this.endpoint}/users`, { withCredentials: true }).subscribe({
        next: (data) => resolve(data || []),
        error: (err) => {
          this.toast.error('Could not load users', err.error?.detail || 'Please try again.')
          resolve([])
        }
      })
    })
  }

  findOneUser(userId: number) {
    return new Promise<IUser | null>((resolve) => {
      this.http.get<IUser>(`${this.endpoint}/users/${userId}`, { withCredentials: true }).subscribe({
        next: (data) => resolve(data || null),
        error: (err) => {
          this.toast.error('Could not load user', err.error?.detail || 'Please try again.')
          resolve(null)
        }
      })
    })
  }

  createUser(data: any) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/users`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('User created', 'The user account was created successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not create user', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  editUser(userId: number, data: any) {
    return new Promise<boolean>((resolve) => {
      this.http.put<any>(`${this.endpoint}/users/me`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res) {
            this.toast.success('Profile updated', 'Your information was updated successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not update profile', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  deleteUser(userId: number) {
    return new Promise<boolean>((resolve) => {
      this.http.delete<any>(`${this.endpoint}/users/${userId}`, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('User deleted', 'The user was deleted successfully.')
          }
          resolve(!!res)
        },
        error: (err) => {
          this.toast.error('Could not delete user', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  editPassword(data: any) {
    return new Promise<boolean>((resolve) => {
      this.http.post<any>(`${this.endpoint}/auth/update-password`, data, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res?.message) {
            this.toast.success('Password updated', res.message)
          }
          resolve(!!res?.message)
        },
        error: (err) => {
          this.toast.error('Could not update password', err.error?.detail || 'Please try again.')
          resolve(false)
        }
      })
    })
  }

  private extractUserData(data: any): ISigninData | null {
    const source = data?.data?.user ?? data?.user ?? data?.data ?? data

    if (!source) {
      return null
    }

    const role = source.role === 'ADMIN' ? 'ADMIN' : 'BASIC'

    return {
      user: {
        accessId: Number(source.userId ?? source.id ?? source.accessId ?? 0),
        email: source.email ?? '',
        fullName: source.fullName ?? source.fullname ?? '',
        active: source.active ?? true,
        role
      }
    }
  }
}
