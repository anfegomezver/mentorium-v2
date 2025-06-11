import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { hasEmailError, isRequired } from '../../utils/validators';
import { AuthService } from '../../data-access/auth/auth.service';
import { toast } from 'ngx-sonner';
import { Router, RouterLink } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';
import { type UserCreate, UsersService } from '../../data-access/users/users.service';
import { CommonModule } from '@angular/common';

interface FormRegister {
  username: FormControl<string | null>;
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
})
export default class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _usersService = inject(UsersService);

  loading = signal(false);
  isChecked = signal(false);

  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  passwordsMatchValidator(form: any) {
    const password = form.get('password')?.value;
    const repeatPassword = form.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordsMismatch: true };
  }

  hasPasswordError() {
    const passwordControl = this.form.get('password');
    if (!passwordControl) return false;

    return passwordControl.hasError('minlength') || passwordControl.hasError('pattern');
  }

  onCheckboxChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.isChecked.set(inputElement.checked);
  }

  form = this._formBuilder.group<FormRegister>(
    {
      username: this._formBuilder.control('', Validators.required),
      name: this._formBuilder.control('', Validators.required),
      email: this._formBuilder.control('', [Validators.required, Validators.email]),
      password: this._formBuilder.control('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      ]),
      repeatPassword: this._formBuilder.control('', Validators.required),
    },
    { validators: (form) => this.passwordsMatchValidator(form) }
  );

  async submit() {

    if (this.form.valid && this.isChecked()) {
      const { email, password } = this.form.value;

      if (!email || !password) {
        return;
      }
      try {
        this.loading.set(true);

        // 1. Registrar en Firebase Auth
        const userCredential = await this._authService.register({
          email,
          password,
        });
        const uid = userCredential.user.uid;

        // 2. Guardar en Firestore con el email
        const user: UserCreate = {
          username: this.form.value.username || '',
          name: this.form.value.name || '',
          email: email, // Importante: guardar el email para poder buscar por él
        };

        await this._usersService.createWithUID(user, uid);

        toast.success('Usuario creado correctamente');
        this._router.navigateByUrl('/dashboard');
      } catch (error) {
        toast.error('Error al crear el usuario');
      } finally {
        this.loading.set(false);
      }
    }

  }
  async submitWithGoogle() {
    try {
      this.loading.set(true);

      // 1. Autenticar con Google y obtener el resultado
      const userCredential = await this._authService.loginGoogle();
      const user = userCredential.user;

      if (user && user.email) {
        // 2. Verificar si el usuario ya existe en Firestore
        const existingUser = await this._usersService.getUserByEmail(
          user.email
        );

        // 3. Si no existe, crear un nuevo perfil en Firestore
        if (!existingUser) {
          console.log('Creando nuevo perfil para usuario de Google');

          // Crear objeto de usuario con la información de Google
          const newUser = {
            username: user.displayName || user.email.split('@')[0], // Usar displayName o parte del email como username
            name: user.displayName || '',
            email: user.email,
          };

          // Guardar en Firestore usando el UID como identificador
          await this._usersService.createWithUID(newUser, user.uid);
          console.log('Perfil creado exitosamente');
        } else {
          console.log('Usuario ya existe en Firestore');
        }
      }

      toast.success('Bienvenido');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      console.error('Error en login con Google:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }
}
