import { Component, inject, signal } from "@angular/core"
import { FormBuilder, type FormControl, ReactiveFormsModule, Validators } from "@angular/forms"
import { AuthService } from "../../data-access/auth.service"
import { hasEmailError, isRequired } from "../../utils/validators"
import { toast } from "ngx-sonner"
import { Router, RouterLink } from "@angular/router"
import { GoogleButtonComponent } from "../../ui/google-button/google-button.component"
import { FacebookButtonComponent } from "../../ui/facebook-button/facebook-button.component"
import { GithubButtonComponent } from "../../ui/github-button/github-button.component"
import { UsersService, type AuthProvider } from "../../data-access/users.service"
import { CommonModule } from "@angular/common"
import { Timestamp } from "@angular/fire/firestore"

interface FormLogin {
  email: FormControl<string | null>
  password: FormControl<string | null>
}

@Component({
  selector: "app-login",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    FacebookButtonComponent,
    GithubButtonComponent,
    CommonModule,
  ],
  templateUrl: "./login.component.html",
})
export default class LoginComponent {
  private _formBuilder = inject(FormBuilder)
  private _authService = inject(AuthService)
  private _router = inject(Router)
  private _usersService = inject(UsersService)

  loading = signal(false)

  isRequired(field: "email" | "password") {
    return isRequired(field, this.form)
  }

  hasEmailError() {
    return hasEmailError(this.form)
  }

  hasPasswordError() {
    const passwordControl = this.form.get("password")
    if (!passwordControl) return false

    return passwordControl.hasError("minlength") || passwordControl.hasError("pattern")
  }

  form = this._formBuilder.group<FormLogin>({
    email: this._formBuilder.control("", [Validators.required, Validators.email]),
    password: this._formBuilder.control("", [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
    ]),
  })

  async submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value

      if (!email || !password) {
        return
      }
      try {
        this.loading.set(true)

        await this._authService.login({ email, password })

        toast.success("¡Bienvenido!")
        this._router.navigateByUrl("/dashboard")
      } catch (error: any) {
        toast.error("Credenciales incorrectas")
      } finally {
        this.loading.set(false)
      }
    }
  }

  async submitWithGoogle() {
    try {
      this.loading.set(true)

      const userCredential = await this._authService.loginGoogle()
      const user = userCredential.user

      await this.handleUserLogin(user, "google.com", "Google")

      toast.success("¡Bienvenido!")
      this._router.navigateByUrl("/dashboard")
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("Esta cuenta ya existe con otro método de inicio de sesión")
      } else {
        toast.error("Error al conectar con Google")
      }
    } finally {
      this.loading.set(false)
    }
  }

  async submitWithFacebook() {
    try {
      this.loading.set(true)

      const userCredential = await this._authService.loginFacebook()
      const user = userCredential.user

      await this.handleUserLogin(user, "facebook.com", "Facebook")

      toast.success("¡Bienvenido!")
      this._router.navigateByUrl("/dashboard")
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("Esta cuenta ya existe con otro método de inicio de sesión")
      } else {
        toast.error("Error al conectar con Facebook")
      }
    } finally {
      this.loading.set(false)
    }
  }

  async submitWithGitHub() {
    try {
      this.loading.set(true)

      const userCredential = await this._authService.loginGitHub()
      const user = userCredential.user

      await this.handleUserLogin(user, "github.com", "GitHub")

      toast.success("¡Bienvenido!")
      this._router.navigateByUrl("/dashboard")
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("Esta cuenta ya existe con otro método de inicio de sesión")
      } else {
        toast.error("Error al conectar con GitHub")
      }
    } finally {
      this.loading.set(false)
    }
  }

  private async handleUserLogin(user: any, providerId: string, displayName: string) {
    if (!user || !user.email) return

    try {
      const existingUser = await this._usersService.getUserByUID(user.uid)

      if (!existingUser) {
        const newUser = {
          username: user.email.split("@")[0] || `user_${Date.now()}`,
          name: user.displayName || user.email.split("@")[0] || "",
          email: user.email,
        }

        const provider: AuthProvider = {
          providerId,
          displayName,
          providerDisplayName: user.displayName || user.email,
          linkedAt: Timestamp.now(),
        }

        await this._usersService.createWithUID(newUser, user.uid, provider)
      } else {
        const isLinked = await this._usersService.isProviderLinked(user.uid, providerId)

        if (!isLinked) {
          const provider: AuthProvider = {
            providerId,
            displayName,
            providerDisplayName: user.displayName || user.email,
            linkedAt: Timestamp.now(),
          }

          await this._usersService.addProviderToUser(user.uid, provider)
          toast.success(`${displayName} vinculado a tu cuenta`)
        }
      }
    } catch (error) {
      // No interrumpir el login si hay error en Firestore
    }
  }
}
