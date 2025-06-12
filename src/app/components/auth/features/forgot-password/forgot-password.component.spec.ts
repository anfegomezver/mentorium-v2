import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { AuthService } from '../../data-access/auth/auth.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export default class ForgotPasswordComponent {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);

  loading = signal(false);

  form = this._fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async submit() {
    if (this.form.invalid) {
      toast.error('Correo inválido');
      return;
    }

    const email = this.form.value.email;
    if (!email) return;

    try {
      this.loading.set(true);
      await this._authService.resetPassword(email);
      toast.success('Correo de recuperación enviado');
    } catch (err) {
      toast.error('No se pudo enviar el correo');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
