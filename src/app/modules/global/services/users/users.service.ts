import { inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import {
  IForgetPasswordRequest,
  IGoogleSigninRequest,
  IRegisterRequest,
  ISigninData,
  ISigninRequest,
  IUpdatePasswordRequest,
  IValidateCodeRequest
} from '../../interfaces/ISignin'
import { IUser, IUserUpdateRequest } from '../../interfaces/IUser'
import { ApiClientService } from '../api/api-client.service'
import { extractApiErrorMessage, isHandledByGlobalErrorInterceptor } from '../api/api-error'
import { AuthSessionStore } from '../auth/auth-session.store'
import { StorageService } from '../local-storage/storage.service'
import { AppToastService } from '../toast/app-toast.service'

interface IApiEnvelope<T> {
  message?: string
  data?: T
}

interface IUserApi {
  id?: number
  userId?: number
  email?: string
  fullName?: string
  fullname?: string
  role?: 'BASIC' | 'ADMIN' | string
  active?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private api = inject(ApiClientService)
  private toast = inject(AppToastService)
  private storageService = inject(StorageService)
  private authSessionStore = inject(AuthSessionStore)
  private router = inject(Router)

  user$ = this.authSessionStore.user$

  get currentUser(): ISigninData | null {
    return this.authSessionStore.currentUser
  }

  async signin(data: ISigninRequest): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.post<unknown>('/auth/login', data))
      const userFromLogin = this.extractUserData(response)

      if (userFromLogin) {
        this.authSessionStore.setUser(userFromLogin)
      }

      const rehydrated = await this.rehydrateSession()
      if (rehydrated || !!userFromLogin) {
        return true
      }

      this.toast.error('Sign-in failed', 'Could not read your session from the server response.')
      return false
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/auth/login')) {
        this.toast.error('Sign-in failed', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async signinWithGoogle(token: string): Promise<boolean> {
    const payload: IGoogleSigninRequest = { token }

    try {
      const response = await firstValueFrom(this.api.post<unknown>('/auth/google/login', payload))
      const userFromLogin = this.extractUserData(response)

      if (userFromLogin) {
        this.authSessionStore.setUser(userFromLogin)
      }

      const rehydrated = await this.rehydrateSession()
      if (rehydrated || !!userFromLogin) {
        return true
      }

      this.toast.error('Google sign-in failed', 'Could not read your session from the server response.')
      return false
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/auth/google/login')) {
        this.toast.error('Google sign-in failed', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async register(data: IRegisterRequest): Promise<boolean> {
    const payload = this.buildRegisterPayload(data)

    try {
      const response = await firstValueFrom(this.api.post<IApiEnvelope<unknown>>('/users', payload))
      const message = response?.message || 'Your account was created successfully.'
      this.toast.success('Account created', message)
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/users')) {
        this.toast.error('Could not create account', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async logout(): Promise<boolean> {
    try {
      await firstValueFrom(this.api.post('/auth/logout', {}))
      this.clearSessionState()
      await this.router.navigate(['/signin'])
      return true
    } catch {
      this.clearSessionState()
      await this.router.navigate(['/signin'])
      return false
    }
  }

  async rehydrateSession(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.get<unknown>('/users/me'))
      const userData = this.extractUserData(response)

      if (!userData) {
        this.clearSessionState()
        return false
      }

      this.authSessionStore.setUser(userData)
      return true
    } catch {
      this.clearSessionState()
      return false
    }
  }

  async sendEmailForgetPassword(data: IForgetPasswordRequest): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.post<IApiEnvelope<unknown>>('/auth/forget-password', data))
      this.toast.success('Email sent', response?.message || 'Check your inbox for the verification code.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/auth/forget-password')) {
        this.toast.error('Could not send email', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async validateCode(data: IValidateCodeRequest): Promise<boolean> {
    try {
      await firstValueFrom(this.api.post<IApiEnvelope<unknown>>('/auth/validate-code', data))
      this.toast.success('Code validated', 'Your verification code is valid.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/auth/validate-code')) {
        this.toast.error('Invalid code', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async validateHashCode(data: { code?: string; hash?: string }): Promise<boolean> {
    const code = `${data?.code ?? data?.hash ?? ''}`.trim()

    if (!code) {
      this.toast.error('Invalid code', 'Enter the verification code sent to your email.')
      return false
    }

    return this.validateCode({ code })
  }

  async updatePasswordWithoutOldPassword(data: IUpdatePasswordRequest): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.api.post<IApiEnvelope<unknown>>('/auth/update-password', data))
      this.clearSessionState()
      this.toast.success('Password updated', response?.message || 'Your password was reset successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/auth/update-password')) {
        this.toast.error('Could not update password', extractApiErrorMessage(error))
      }
      return false
    }
  }

  async editPasswordWithOutOldPassword(_userId: string, data: { newPassword?: string; password?: string }): Promise<boolean> {
    const password = (data?.newPassword || data?.password || '').trim()

    if (!password) {
      this.toast.error('Could not update password', 'Password is required.')
      return false
    }

    return this.updatePasswordWithoutOldPassword({ password })
  }

  async editPassword(data: { newPassword?: string; password?: string }): Promise<boolean> {
    const password = (data?.newPassword || data?.password || '').trim()

    if (!password) {
      this.toast.error('Could not update password', 'Password is required.')
      return false
    }

    return this.updatePasswordWithoutOldPassword({ password })
  }

  async getCurrentUser(): Promise<IUser | null> {
    try {
      const response = await firstValueFrom(this.api.get<unknown>('/users/me'))
      return this.normalizeUser(this.extractSource(response))
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/users/me')) {
        this.toast.error('Could not load profile', extractApiErrorMessage(error))
      }
      return null
    }
  }

  async updateCurrentUser(data: IUserUpdateRequest): Promise<boolean> {
    const payload: { email?: string; fullname?: string } = {}

    if (data.email?.trim()) {
      payload.email = data.email.trim()
    }

    if (data.fullName?.trim()) {
      payload.fullname = data.fullName.trim()
    }

    if (!Object.keys(payload).length) {
      this.toast.info('No changes detected', 'Update at least one field before saving.')
      return false
    }

    try {
      await firstValueFrom(this.api.put<IApiEnvelope<unknown>>('/users/me', payload))
      await this.rehydrateSession()
      this.toast.success('Profile updated', 'Your information was updated successfully.')
      return true
    } catch (error) {
      if (!isHandledByGlobalErrorInterceptor(error, '/users/me')) {
        this.toast.error('Could not update profile', extractApiErrorMessage(error))
      }
      return false
    }
  }

  private clearSessionState() {
    this.authSessionStore.clear()
    this.storageService.deleteLocalStorage('USER-BASIC-TEMPLATE')
  }

  private buildRegisterPayload(data: IRegisterRequest) {
    return {
      fullName: data.fullName.trim().replace(/\s+/g, ' '),
      email: data.email.trim(),
      password: data.password
    }
  }

  private extractUserData(payload: unknown): ISigninData | null {
    const source = this.extractSource(payload)
    const user = this.normalizeUser(source)

    if (!user) {
      return null
    }

    return {
      user: {
        userId: user.userId,
        accessId: user.userId,
        email: user.email,
        fullName: user.fullName,
        active: user.active ?? true,
        role: user.role
      }
    }
  }

  private extractSource(payload: unknown) {
    const data = payload as {
      data?: {
        user?: IUserApi
      } | IUserApi
      user?: IUserApi
    }

    const nestedData = data?.data
    const hasNestedUser = typeof nestedData === 'object' && nestedData !== null && 'user' in nestedData

    return hasNestedUser
      ? (nestedData as { user?: IUserApi }).user ?? null
      : (nestedData as IUserApi | undefined) ?? data?.user ?? (payload as IUserApi | null)
  }

  private normalizeUser(source: IUserApi | null): IUser | null {
    if (!source) {
      return null
    }

    const userId = Number(source.userId ?? source.id ?? 0)
    const email = `${source.email ?? ''}`.trim()
    const fullName = `${source.fullName ?? source.fullname ?? ''}`.trim()
    const role = source.role === 'ADMIN' ? 'ADMIN' : 'BASIC'

    if (!userId || !email) {
      return null
    }

    return {
      userId,
      email,
      fullName,
      role,
      active: source.active ?? true
    }
  }
}
