import { Component, inject, signal } from '@angular/core';
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
import { FacebookButtonComponent } from '../../ui/facebook-button/facebook-button.component';
import { GithubButtonComponent } from '../../ui/github-button/github-button.component';
import { UsersService } from '../../data-access/users.service';
import { CommonModule } from '@angular/common';

interface FormLogin {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    FacebookButtonComponent,
    GithubButtonComponent,
    CommonModule,
  ],
  templateUrl: './login.component.html',
})
export default class LoginComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _usersService = inject(UsersService);

  loading = signal(false);

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
      try {
        this.loading.set(true); // Añadido para consistencia

        console.log('Email:', email);
        console.log('Password:', password);

        await this._authService.login({ email, password });

        toast.success('Bienvenido');
        this._router.navigateByUrl('/dashboard');
      } catch (error) {
        toast.error('Error al iniciar sesión');
      } finally {
        this.loading.set(false); // Añadido para consistencia
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

          // Crear objeto de usuario con username como null
          const newUser = {
            username: '', // Guardamos username como una cadena vacía
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

  async submitWithFacebook() {
  try {
    this.loading.set(true);  // Mostrar indicador de carga
    
    const cred = await this._authService.loginFacebook();
    const user = cred.user;
    
    if (user && user.email) {
      const existingUser = await this._usersService.getUserByEmail(user.email);
      if (!existingUser) {
        const newUser = {
          username: '',
          name: user.displayName || '',
          email: user.email,
        };
        await this._usersService.createWithUID(newUser, user.uid);
      }
    }
    
    toast.success('Bienvenido');
    this._router.navigateByUrl('/dashboard');  // Redirigir tras login exitoso
    
  } catch (error) {
    console.error('Error al iniciar sesión con Facebook:', error);
    toast.error('Error al iniciar sesión con Facebook');
  } finally {
    this.loading.set(false);  // Quitar indicador de carga
  }
}

  
  async submitWithGitHub() {
    try {
      this.loading.set(true);
      const cred = await this._authService.loginGitHub();
  
      const user = cred.user;
      if (user && user.email) {
        const existingUser = await this._usersService.getUserByEmail(user.email);
        if (!existingUser) {
          const newUser = {
            username: '',
            name: user.displayName || '',
            email: user.email,
          };
          await this._usersService.createWithUID(newUser, user.uid);
        }
      }
  
      toast.success('Bienvenido');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      console.error('Error login GitHub:', error);
      toast.error('Error al iniciar sesión con GitHub');
    } finally {
      this.loading.set(false);
    }
  }
}
