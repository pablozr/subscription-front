import { CardModule } from 'primeng/card'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { ISigninData } from '../../interfaces/ISignin'
import { UsersService } from '../../services/users/users.service'
import { ButtonModule } from 'primeng/button'
import { HeaderComponent } from '../../components/header/header.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, ButtonModule, CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private usersService = inject(UsersService)

  userData!: ISigninData | null
  quickDirections = [
    {
      title: 'Customers',
      detail: 'Account management, customer profile, and operational lifecycle.',
      status: 'Planned',
      icon: 'pi-users'
    },
    {
      title: 'Plans',
      detail: 'Plan catalog, commercial rules, and subscription status.',
      status: 'Planned',
      icon: 'pi-tag'
    },
    {
      title: 'Billing',
      detail: 'Billing, renewals, delinquency management, and future reconciliation.',
      status: 'Planned',
      icon: 'pi-credit-card'
    }
  ]

  ngOnInit() {
    this.usersService.user$.subscribe((data) => {
      this.userData = data
    })
  }

  get fullName() {
    return this.userData?.user?.fullName || 'User'
  }

  get primaryRole() {
    return this.userData?.user?.role ?? 'BASIC'
  }
}
