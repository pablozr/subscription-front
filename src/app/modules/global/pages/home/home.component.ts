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
      detail: 'Gestao de contas, perfil de cliente e lifecycle operacional.',
      status: 'Planejado',
      icon: 'pi-users'
    },
    {
      title: 'Plans',
      detail: 'Catalogo de planos, regras comerciais e status de assinatura.',
      status: 'Planejado',
      icon: 'pi-tag'
    },
    {
      title: 'Billing',
      detail: 'Cobranca, renovacoes, inadimplencia e conciliacao futura.',
      status: 'Planejado',
      icon: 'pi-credit-card'
    }
  ]

  ngOnInit() {
    this.usersService.user$.subscribe((data) => {
      this.userData = data
    })
  }

  get fullName() {
    const firstName = this.userData?.user?.firstName ?? 'Usuario'
    const lastName = this.userData?.user?.lastName ?? ''

    return `${firstName} ${lastName}`.trim()
  }

  get primaryRole() {
    return this.userData?.user?.roles?.[0] ?? 'MEMBRO'
  }
}
