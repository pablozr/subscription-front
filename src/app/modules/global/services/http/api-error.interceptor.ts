import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { AppToastService } from '../toast/app-toast.service'
import { StorageService } from '../local-storage/storage.service'
import { AuthSessionStore } from '../auth/auth-session.store'
import { PUBLIC_AUTH_PATHS } from './public-auth-paths'

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const toast = inject(AppToastService)
  const storage = inject(StorageService)
  const authSessionStore = inject(AuthSessionStore)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicAuthPath(req.url)) {
        const hadSession = !!authSessionStore.currentUser
        authSessionStore.clear()
        storage.deleteLocalStorage('USER-BASIC-TEMPLATE')

        if (hadSession && !isAuthScreen(router.url)) {
          toast.warn('Session expired', 'Please sign in again.')
          router.navigate(['/signin'])
        }
      }

      if (error.status === 429) {
        const retryAfter = error.headers.get('Retry-After')
        const retryMessage = retryAfter
          ? `Try again in about ${retryAfter} second(s).`
          : 'Too many requests. Please wait a moment and try again.'

        toast.warn('Rate limit reached', retryMessage)
      }

      if (error.status === 503) {
        toast.error('Service unavailable', 'Temporary infrastructure issue. Please try again soon.')
      }

      return throwError(() => error)
    })
  )
}

function isPublicAuthPath(url: string) {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

function isAuthScreen(route: string) {
  return route.startsWith('/signin') || route.startsWith('/register') || route.startsWith('/forget-password')
}
