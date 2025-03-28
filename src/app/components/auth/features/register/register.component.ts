import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { hasEmailError, isRequired } from '../../utils/validators';
import { AuthService } from '../../data-access/auth.service';
import { toast } from 'ngx-sonner';
import { Router, RouterLink } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';

interface FormRegister {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
  templateUrl: './register.component.html',
})
export default class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  form = this._formBuilder.group<FormRegister>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', Validators.required),
  });

  async submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      if (!email || !password) {
        return;
      }
      try {
        console.log('Email:', email);
        console.log('Password:', password);

        await this._authService.register({ email, password });

        toast.success('Usuario creado correctamente');
        this._router.navigateByUrl('/dashboard');
      } catch (error) {
        toast.error('Error al crear el usuario');
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
