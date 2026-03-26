import { Component, inject } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { ToolbarModule } from 'primeng/toolbar'
import { SidebarComponent } from '../sidebar/sidebar.component'
import { AvatarModule } from 'primeng/avatar'
import { ISigninData } from '../../interfaces/ISignin'
import { UsersService } from '../../services/users/users.service'
import { CommonModule } from '@angular/common'
import { ButtonThemeComponent } from '../button-theme/button-theme.component'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, SidebarComponent, AvatarModule, CommonModule, ButtonThemeComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private usersService = inject(UsersService)

  userData!: ISigninData | null

  ngOnInit() {
    this.usersService.user$.subscribe((data) => {
      this.userData = data
    })
  }

  getUserRole(roles: string[] | undefined) {
    if (roles) {
      return roles[0]
    } else {
      return 'SEM CARGO'
    }
  }

  get fullName() {
    const firstName = this.userData?.user?.firstName ?? 'Usuario'
    const lastName = this.userData?.user?.lastName ?? ''

    return `${firstName} ${lastName}`.trim()
  }
}
