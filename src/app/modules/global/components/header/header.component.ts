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

  get userRole() {
    return this.userData?.user?.role ?? 'BASIC'
  }

  get fullName() {
    return this.userData?.user?.fullName || 'Usuario'
  }
}
