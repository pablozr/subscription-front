import { UsersService } from './../../services/users/users.service';
import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppToastService } from '../../services/toast/app-toast.service';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ButtonThemeComponent } from '../../components/button-theme/button-theme.component';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [StepsModule, ButtonModule, CardModule, ReactiveFormsModule, FormsModule, InputTextModule, FloatLabelModule, CommonModule, LoadingComponent, ButtonThemeComponent, RippleModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent implements OnInit {
    usersServices = inject(UsersService);

    private router = inject(Router);
    private toast = inject(AppToastService);

    isLoading: boolean = false;

    isInvalidEmail: boolean = false;

    isInvalidHash: boolean = false;

    isInvalidNewPassword: boolean = false;
    isInvalidPasswordConfirm: boolean = false;

    userForgetPasswordId: string = '';

    items: MenuItem[] | undefined;
    active: number = 0;

    forgetPasswordEmailForm!: FormGroup;
    forgetPasswordHashForm!: FormGroup;
    forgetPasswordNewPasswordForm!: FormGroup;


    ngOnInit() {
      this.items = [
        {
          label: 'Email',
        },
        {
          label: 'Código',
        },
        {
          label: 'Nova Senha',
        }
      ];

      this.forgetPasswordEmailForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
      })

      this.forgetPasswordHashForm = new FormGroup({
        hash: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
      })

      this.forgetPasswordNewPasswordForm = new FormGroup({
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        passwordConfirm: new FormControl('', [Validators.required])
      })
    }

    navigateTo(route: string){
      this.router.navigate([route]);
    }

    async onSubmitEmail(){
      if (this.forgetPasswordEmailForm.valid){
        this.isLoading = true;

        const validation = await this.usersServices.sendEmailForgetPassword(this.forgetPasswordEmailForm.value);

        this.isLoading = false;

        if (typeof(validation) == 'object'){
          this.active = 1
          this.userForgetPasswordId = `${validation?.id}`;
          this.isInvalidEmail = false;
        } else{
          this.isInvalidEmail = true;
        }
      } else{
        this.forgetPasswordEmailForm.markAllAsTouched();
        this.toast.error('E-mail vazio', 'Preencha todos os campos antes de continuar.');
        this.isInvalidEmail = true;
      }
    }

    async onSubmitHashCode(){
      if (this.forgetPasswordHashForm.valid){
        this.isLoading = true;

        const validation = await this.usersServices.validateHashCode({hash: this.forgetPasswordHashForm.value.hash, userId: this.userForgetPasswordId});

        this.isLoading = false;

          if (validation){
            this.active = 2
            this.isInvalidHash = false;
          } else{
            this.isInvalidHash = true;
          }
      } else{
        this.forgetPasswordHashForm.markAllAsTouched();
        this.toast.error('Codigo vazio', 'Preencha todos os campos antes de continuar.');
        this.isInvalidHash = true;
      }
    }

    async onSubmitNewPassword(){
      if (this.forgetPasswordNewPasswordForm.valid && this.userForgetPasswordId){
        const { newPassword, passwordConfirm } = this.forgetPasswordNewPasswordForm.value;
        if (newPassword !== passwordConfirm) {
          this.toast.error('Senhas diferentes', 'A confirmacao deve ser igual a nova senha.');
          this.isInvalidPasswordConfirm = true;
          this.forgetPasswordNewPasswordForm.get('passwordConfirm')?.markAsTouched();
          return;
        }

        this.isLoading = true;

        const validation = await this.usersServices.editPasswordWithOutOldPassword(this.userForgetPasswordId, {...this.forgetPasswordNewPasswordForm.value});

        this.isLoading = false;

        if (validation){
          this.isInvalidNewPassword = false;
          this.isInvalidPasswordConfirm = false;
          this.navigateTo('signin');
        } else{
          this.isInvalidNewPassword = true;
          this.isInvalidPasswordConfirm = true;
        }
    } else{
      this.forgetPasswordNewPasswordForm.markAllAsTouched();
      this.toast.error('Dados incompletos', 'Preencha todos os campos antes de continuar.');
      this.isInvalidNewPassword = true;
      this.isInvalidPasswordConfirm = true;
      }
    }

    isControlInvalid(form: FormGroup, fieldName: string): boolean {
      const control = form.get(fieldName);
      return !!control && control.invalid && (control.touched || control.dirty);
    }

    getControlError(form: FormGroup, fieldName: string): string {
      const control = form.get(fieldName);

      if (!control?.errors) {
        return '';
      }

      if (control.errors['required']) {
        return 'Este campo e obrigatorio.';
      }

      if (control.errors['email']) {
        return 'Informe um e-mail valido.';
      }

      if (control.errors['minlength']) {
        const required = control.errors['minlength'].requiredLength;
        return `Minimo de ${required} caracteres.`;
      }

      if (control.errors['maxlength']) {
        const required = control.errors['maxlength'].requiredLength;
        return `Maximo de ${required} caracteres.`;
      }

      return 'Campo invalido.';
    }

    get passwordsMismatch(): boolean {
      const password = this.forgetPasswordNewPasswordForm?.get('newPassword')?.value;
      const confirmControl = this.forgetPasswordNewPasswordForm?.get('passwordConfirm');
      const confirmPassword = confirmControl?.value;

      return !!password && !!confirmPassword && password !== confirmPassword && !!confirmControl && (confirmControl.touched || confirmControl.dirty);
    }
}
