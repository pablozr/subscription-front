import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { environment } from '../../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient)
  private base = environment.apiBaseUrl

  get<T>(path: string, options: Record<string, unknown> = {}) {
    return this.http.get<T>(this.resolvePath(path), options)
  }

  post<T>(path: string, body: unknown, options: Record<string, unknown> = {}) {
    return this.http.post<T>(this.resolvePath(path), body, options)
  }

  put<T>(path: string, body: unknown, options: Record<string, unknown> = {}) {
    return this.http.put<T>(this.resolvePath(path), body, options)
  }

  patch<T>(path: string, body: unknown = {}, options: Record<string, unknown> = {}) {
    return this.http.patch<T>(this.resolvePath(path), body, options)
  }

  delete<T>(path: string, options: Record<string, unknown> = {}) {
    return this.http.delete<T>(this.resolvePath(path), options)
  }

  private resolvePath(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    return `${this.base}${path}`
  }
}
