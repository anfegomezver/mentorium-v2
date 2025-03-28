import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { hasEmailError, isRequired } from '../../utils/validators';
import { toast } from 'ngx-sonner';
import { Router, RouterLink } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';
import { CommonModule } from '@angular/common';

interface FormLogin {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent, CommonModule],
  templateUrl: './login.component.html',
})

export default class LoginComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  hasPasswordError() {
    const passwordControl = this.form.get('password');
    if (!passwordControl) return false;
  
    return passwordControl.hasError('minlength') || passwordControl.hasError('pattern');
  }

  form = this._formBuilder.group<FormLogin>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]),
  });

  async submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      if (!email || !password) {
        return;
      }

      if (password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      
      try {
        console.log('Email:', email);
        console.log('Password:', password);

        await this._authService.login({ email, password });

        toast.success('Bienvenido');
        this._router.navigateByUrl('/dashboard');
      } catch (error) {
        toast.error('Error al logearse');
      }
    }
  }

  async submitWithGoogle() {
    try {
      await this._authService.loginGoogle();
      toast.success('Bienvenido');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      toast.error('Error al logearse');
    }
  }
}
