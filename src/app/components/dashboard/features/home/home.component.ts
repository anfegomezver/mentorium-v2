import { Component, type OnInit, type OnDestroy, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink } from "@angular/router"
import {
  Auth,
  onAuthStateChanged,
  linkWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
} from "@angular/fire/auth"
import Swal from "sweetalert2"
import { UsersService, type AuthProvider } from "../../../auth/data-access/users.service"
import { TaskService } from "../task.service"
import { TableComponent } from "../ui/table/table.component"
import { toast } from "ngx-sonner"
import { Timestamp } from "@angular/fire/firestore"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, OnDestroy {
  userProfile: any = null
  email: string | null = null
  tasks = inject(TaskService).getTasks
  currentUser: any = null

  private readonly LAST_ACTIVITY_KEY = "lastActivityTimestamp"
  private auth = inject(Auth)
  private usersService = inject(UsersService)
  private router = inject(Router)
  private taskService = inject(TaskService)

  private inactivityTimeoutId: any
  private readonly INACTIVITY_LIMIT_MS = 10000
  private alertRunning = false

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
        this.currentUser = user
        this.email = user.email
        await this.loadUserByEmail(user.email)

        const lastActivityStr = localStorage.getItem(this.LAST_ACTIVITY_KEY)
        const now = Date.now()

        if (lastActivityStr) {
          const lastActivity = Number.parseInt(lastActivityStr, 10)
          const timeElapsed = now - lastActivity

          if (timeElapsed >= this.INACTIVITY_LIMIT_MS) {
            await this.showInactivityAlert()
            return
          }
        }

        this.startInactivityTimer()
      }
    })
  }

  ngOnDestroy(): void {
    this.stopInactivityTimer()
  }

  private async loadUserByEmail(email: string): Promise<void> {
    try {
      this.userProfile = await this.usersService.getUserByEmail(email)
    } catch (error) {
      console.error("Error al cargar usuario:", error)
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.taskService.delete(id)
    } catch (error) {
      console.error("Error eliminando la tarea:", error)
    }
  }

  // Sistema de vinculación de proveedores
  async linkGoogle(): Promise<void> {
    if (!this.currentUser) {
      toast.error("Usuario no autenticado")
      return
    }

    try {
      const isAlreadyLinked = await this.usersService.isProviderLinked(this.currentUser.uid, "google.com")

      if (isAlreadyLinked) {
        toast.info("Google ya vinculado")
        return
      }

      const googleProvider = new GoogleAuthProvider()
      const result = await linkWithPopup(this.currentUser, googleProvider)

      const provider: AuthProvider = {
        providerId: "google.com",
        displayName: "Google",
        providerDisplayName: result.user.displayName || result.user.email || "",
        linkedAt: Timestamp.now(),
      }

      await this.usersService.addProviderToUser(this.currentUser.uid, provider)
      await this.loadUserByEmail(this.email!)

      toast.success("¡Google vinculado exitosamente!")
    } catch (error: any) {
      toast.error("Error al vincular Google")
    }
  }

  async linkFacebook(): Promise<void> {
    if (!this.currentUser) {
      toast.error("Usuario no autenticado")
      return
    }

    try {
      const isAlreadyLinked = await this.usersService.isProviderLinked(this.currentUser.uid, "facebook.com")

      if (isAlreadyLinked) {
        toast.info("Facebook ya vinculado")
        return
      }

      const facebookProvider = new FacebookAuthProvider()
      const result = await linkWithPopup(this.currentUser, facebookProvider)

      const provider: AuthProvider = {
        providerId: "facebook.com",
        displayName: "Facebook",
        providerDisplayName: result.user.displayName || result.user.email || "",
        linkedAt: Timestamp.now(),
      }

      await this.usersService.addProviderToUser(this.currentUser.uid, provider)
      await this.loadUserByEmail(this.email!)

      toast.success("¡Facebook vinculado exitosamente!")
    } catch (error: any) {
      toast.error("Error al vincular Facebook")
    }
  }

  async linkGitHub(): Promise<void> {
    if (!this.currentUser) {
      toast.error("Usuario no autenticado")
      return
    }

    try {
      const isAlreadyLinked = await this.usersService.isProviderLinked(this.currentUser.uid, "github.com")

      if (isAlreadyLinked) {
        toast.info("GitHub ya vinculado")
        return
      }

      const githubProvider = new GithubAuthProvider()
      const result = await linkWithPopup(this.currentUser, githubProvider)

      const provider: AuthProvider = {
        providerId: "github.com",
        displayName: "GitHub",
        providerDisplayName: result.user.displayName || result.user.email || "",
        linkedAt: Timestamp.now(),
      }

      await this.usersService.addProviderToUser(this.currentUser.uid, provider)
      await this.loadUserByEmail(this.email!)

      toast.success("¡GitHub vinculado exitosamente!")
    } catch (error: any) {
      toast.error("Error al vincular GitHub")
    }
  }

  async linkPassword(): Promise<void> {
    if (!this.currentUser) {
      toast.error("Usuario no autenticado")
      return
    }

    try {
      const isAlreadyLinked = await this.usersService.isProviderLinked(this.currentUser.uid, "password")

      if (isAlreadyLinked) {
        toast.info("Email/Password ya configurado")
        return
      }

      const { value: formValues } = await Swal.fire({
        title: "Vincular Email/Contraseña",
        html: `
          <div class="text-left space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="swal-input-email" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" 
                     type="email" value="${this.currentUser.email}" readonly>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input id="swal-input-password" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                     type="password" placeholder="Mínimo 8 caracteres">
              <p class="text-xs text-gray-500 mt-1">Debe contener: mayúscula, minúscula, número y símbolo</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input id="swal-input-confirm" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                     type="password" placeholder="Repite la contraseña">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Vincular",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3b82f6",
        preConfirm: () => {
          const email = (document.getElementById("swal-input-email") as HTMLInputElement).value
          const password = (document.getElementById("swal-input-password") as HTMLInputElement).value
          const confirmPassword = (document.getElementById("swal-input-confirm") as HTMLInputElement).value

          if (!password) {
            Swal.showValidationMessage("La contraseña es requerida")
            return false
          }

          if (password.length < 8) {
            Swal.showValidationMessage("La contraseña debe tener al menos 8 caracteres")
            return false
          }

          if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(password)) {
            Swal.showValidationMessage("La contraseña debe contener mayúscula, minúscula, número y símbolo")
            return false
          }

          if (password !== confirmPassword) {
            Swal.showValidationMessage("Las contraseñas no coinciden")
            return false
          }

          return { email, password }
        },
      })

      if (formValues) {
        const credential = EmailAuthProvider.credential(formValues.email, formValues.password)
        await linkWithCredential(this.currentUser, credential)

        const provider: AuthProvider = {
          providerId: "password",
          displayName: "Email/Contraseña",
          providerDisplayName: formValues.email,
          linkedAt: Timestamp.now(),
        }

        await this.usersService.addProviderToUser(this.currentUser.uid, provider)
        await this.loadUserByEmail(this.email!)

        toast.success("¡Email/Password vinculado exitosamente!")
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este email ya tiene una contraseña asociada")
      } else if (error.code === "auth/weak-password") {
        toast.error("La contraseña es muy débil")
      } else {
        toast.error("Error al vincular Email/Contraseña")
      }
    }
  }

  isProviderLinked(providerId: string): boolean {
    return this.userProfile?.providers?.some((p: any) => p.providerId === providerId) || false
  }

  getLinkedProviders(): string[] {
    return this.userProfile?.providers?.map((p: any) => p.displayName) || []
  }

  private startInactivityTimer(): void {
    this.alertRunning = true
    localStorage.setItem("alertRunning", "true")
    this.resetInactivityTimer()

    window.addEventListener("mousemove", this.resetInactivityTimer)
    window.addEventListener("keydown", this.resetInactivityTimer)
    window.addEventListener("click", this.resetInactivityTimer)
  }

  private stopInactivityTimer(): void {
    this.alertRunning = false
    localStorage.removeItem("alertRunning")
    clearTimeout(this.inactivityTimeoutId)

    window.removeEventListener("mousemove", this.resetInactivityTimer)
    window.removeEventListener("keydown", this.resetInactivityTimer)
    window.removeEventListener("click", this.resetInactivityTimer)
  }

  private resetInactivityTimer = (): void => {
    clearTimeout(this.inactivityTimeoutId)

    const now = Date.now()
    localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString())

    this.inactivityTimeoutId = setTimeout(async () => {
      const lastActivity = Number.parseInt(localStorage.getItem(this.LAST_ACTIVITY_KEY) || "0", 10)
      const timeElapsed = Date.now() - lastActivity

      if (this.alertRunning && timeElapsed >= this.INACTIVITY_LIMIT_MS) {
        await this.showInactivityAlert()
      }
    }, this.INACTIVITY_LIMIT_MS)
  }

  private async showInactivityAlert(): Promise<void> {
    const result = await Swal.fire({
      title: "¿Eres tú? No se ha detectado actividad reciente",
      text: `Sesión iniciada como ${this.userProfile?.name || "usuario"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, mantener sesión",
      cancelButtonText: "No, cerrar sesión",
      allowOutsideClick: false,
      allowEscapeKey: false,
    })

    if (result.isConfirmed) {
      this.resetInactivityTimer()
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      await this.logout()
    }
  }

  private async logout(): Promise<void> {
    this.stopInactivityTimer()
    localStorage.removeItem(this.LAST_ACTIVITY_KEY)
    localStorage.removeItem("alertRunning")

    await this.auth.signOut()
    toast.success("Hasta luego")
    console.clear()
    this.router.navigate(["/auth/login"])
  }
}
