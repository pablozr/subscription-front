import { provideHttpClient } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { MessageService } from 'primeng/api'

import { ForgetPasswordComponent } from './forget-password.component'

describe('ForgetPasswordComponent', () => {
  let component: ForgetPasswordComponent
  let fixture: ComponentFixture<ForgetPasswordComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasswordComponent],
      providers: [provideHttpClient(), provideRouter([]), MessageService]
    })
    .compileComponents()

    fixture = TestBed.createComponent(ForgetPasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
