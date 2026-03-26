import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { PrimeNG } from 'primeng/config'
import { ThemeService } from './modules/global/services/theme/theme.service'
import { UsersService } from './modules/global/services/users/users.service'
import { ToastModule } from 'primeng/toast'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Template'

  constructor(private primeng: PrimeNG, private themeService: ThemeService, usersService: UsersService) {}

  ngOnInit() {
    this.primeng.ripple.set(true)
  }
}
