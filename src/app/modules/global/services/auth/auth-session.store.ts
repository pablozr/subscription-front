import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { ISigninData } from '../../interfaces/ISignin'

@Injectable({
  providedIn: 'root'
})
export class AuthSessionStore {
  private userSubject = new BehaviorSubject<ISigninData | null>(null)
  user$ = this.userSubject.asObservable()

  get currentUser(): ISigninData | null {
    return this.userSubject.value
  }

  setUser(user: ISigninData | null) {
    this.userSubject.next(user)
  }

  clear() {
    this.userSubject.next(null)
  }
}
