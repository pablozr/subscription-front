import { provideHttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { MessageService } from 'primeng/api'

import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([]), MessageService]
    })
    service = TestBed.inject(AuthService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
