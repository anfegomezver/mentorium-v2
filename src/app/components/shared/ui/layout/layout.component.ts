import { Component, inject, type OnInit, type OnDestroy } from "@angular/core"
import { Router, RouterModule, RouterLink, NavigationEnd } from "@angular/router"
import { AuthStateService } from "../../data-access/auth-state.service"
import { toast } from "ngx-sonner"
import { AccessService } from "../../../auth/data-access/access/access.service"
import { CommonModule } from "@angular/common"
import Swal from "sweetalert2"
import { Auth, onAuthStateChanged } from "@angular/fire/auth"
import { filter } from "rxjs/operators"

@Component({
  selector: "app-layout",
  imports: [RouterModule, RouterLink, CommonModule],
  standalone: true,
  templateUrl: "./layout.component.html",
})
export default class LayoutComponent implements OnInit, OnDestroy {
  private _authState = inject(AuthStateService)
  private _router = inject(Router)
  private accessService = inject(AccessService)
  private auth = inject(Auth)

  private inactivityTimeoutId: any = null
  private readonly INACTIVITY_LIMIT_MS = 30 * 1000 //TIEMPO DE INACTIVIDAD - SE AJUSTA PARA PRUEBAS
  private alertRunning = false
  private isAlertVisible = false
  private lastActivityTime = 0
  private initialAuthCheck = false
  private timeInterval: any = null

  // User info
  currentUserName = ""
  currentUserEmail = ""
  currentRoute = ""
  isLoggingOut = false // Estado para mostrar loading

  // Sidebar toggle state
  sidebarCollapsed = false

  ngOnInit(): void {
    this.startTimer()
    this.updateDateTime()

    // Update time every SECOND for real-time updates
    this.timeInterval = setInterval(() => {
      this.updateDateTime()
    }, 1000)

    // Listen to route changes
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url
    })

    onAuthStateChanged(this.auth, async (user) => {
      if (!this.initialAuthCheck) {
        this.initialAuthCheck = true
        if (user) {
          this.currentUserName = user.displayName || "Usuario"
          this.currentUserEmail = user.email || ""
        }
        return
      }
      if (!user?.email && this.alertRunning) {
        this.stopTimer()
        this._router.navigateByUrl("/auth/login")
      }
    })

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("sidebarCollapsed")
    if (savedSidebarState !== null) {
      this.sidebarCollapsed = JSON.parse(savedSidebarState)
    }
  }

  ngOnDestroy(): void {
    this.stopTimer()
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  }

  private currentTime = ""
  private currentDate = ""

  private updateDateTime(): void {
    const now = new Date()
    // Include seconds for real-time updates
    this.currentTime = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    this.currentDate = now.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  getCurrentTime(): string {
    return this.currentTime
  }

  getCurrentDate(): string {
    return this.currentDate
  }

  getUserInitials(): string {
    if (this.currentUserName) {
      return this.currentUserName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return this.currentUserEmail.charAt(0).toUpperCase()
  }

  getPageTitle(): string {
    const route = this.currentRoute
    if (route === "/dashboard" || route === "/dashboard/") {
      return "Dashboard"
    } else if (route.includes("/dashboard/users")) {
      return "Gestión de Usuarios"
    } else if (route.includes("/dashboard/new")) {
      return "Nueva Tarea"
    } else if (route.includes("/dashboard/edit")) {
      return "Editar Tarea"
    }
    return "Dashboard"
  }

  getPageDescription(): string {
    const route = this.currentRoute
    if (route === "/dashboard" || route === "/dashboard/") {
      return "Bienvenido a tu panel de control"
    } else if (route.includes("/dashboard/users")) {
      return "Administra y consulta los usuarios del sistema"
    } else if (route.includes("/dashboard/new")) {
      return "Crea una nueva tarea"
    } else if (route.includes("/dashboard/edit")) {
      return "Modifica los detalles de la tarea"
    }
    return "Panel de administración"
  }

  // Toggle sidebar method
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed
    // Save state to localStorage
    localStorage.setItem("sidebarCollapsed", JSON.stringify(this.sidebarCollapsed))
  }

  async confirmLogout() {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que quieres cerrar tu sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f87171",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      background: "#ffffff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-xl border border-gray-200",
        confirmButton: "rounded-lg px-6 py-2 font-medium",
        cancelButton: "rounded-lg px-6 py-2 font-medium",
      },
      backdrop: `
        rgba(0,0,0,0.7)
      `,
    })

    if (result.isConfirmed) {
      await this.logOut()
    }
  }

  async logOut() {
    this.isLoggingOut = true // Mostrar loading
    this.stopTimer()

    try {
      // Simular un pequeño delay para mostrar el loading
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const docId = localStorage.getItem("docId")
      if (docId) {
        await this.accessService.registerLogout(docId)
        localStorage.removeItem("docId")
      }

      await this._authState.logOut()
      toast.success("¡Hasta luego! 👋")
      console.clear()
      this._router.navigateByUrl("/auth/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    } finally {
      this.isLoggingOut = false
    }
  }

  private startTimer(): void {
    if (this.alertRunning) {
      return
    }
    this.alertRunning = true
    this.lastActivityTime = Date.now()

    this.addEventListeners()
    this.scheduleCheck()
  }

  private stopTimer(): void {
    this.alertRunning = false
    this.isAlertVisible = false

    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId)
      this.inactivityTimeoutId = null
    }

    this.removeEventListeners()
  }

  private addEventListeners(): void {
    document.addEventListener("mousemove", this.handleActivity)
    document.addEventListener("keydown", this.handleActivity)
    document.addEventListener("click", this.handleActivity)
  }

  private removeEventListeners(): void {
    document.removeEventListener("mousemove", this.handleActivity)
    document.removeEventListener("keydown", this.handleActivity)
    document.removeEventListener("click", this.handleActivity)
  }

  private handleActivity = (): void => {
    if (!this.alertRunning || this.isAlertVisible) return
    this.lastActivityTime = Date.now()
    this.scheduleCheck()
  }

  private scheduleCheck(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId)
    }

    this.inactivityTimeoutId = setTimeout(() => {
      this.checkInactivity()
    }, this.INACTIVITY_LIMIT_MS)
  }

  private async checkInactivity(): Promise<void> {
    if (!this.alertRunning || this.isAlertVisible) {
      return
    }
    const timeElapsed = Date.now() - this.lastActivityTime

    if (timeElapsed >= this.INACTIVITY_LIMIT_MS) {
      await this.showAlert()
    } else {
      const remaining = this.INACTIVITY_LIMIT_MS - timeElapsed
      this.inactivityTimeoutId = setTimeout(() => {
        this.checkInactivity()
      }, remaining)
    }
  }

  private async showAlert(): Promise<void> {
    if (this.isAlertVisible) {
      return
    }
    this.isAlertVisible = true

    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId)
      this.inactivityTimeoutId = null
    }

    try {
      const user = this.auth.currentUser

      const result = await Swal.fire({
        title: "¿Sigues ahí?",
        text: `No se detectó actividad. Usuario: ${user?.displayName ?? "Sin nombre"}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cerrar sesión",
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: "#ffffff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-xl border border-gray-200",
        },
        backdrop: `
          rgba(0,0,0,0.7)
        `,
      })
      this.isAlertVisible = false

      if (result.isConfirmed) {
        this.lastActivityTime = Date.now()
        this.scheduleCheck()
      } else {
        await this.logOut()
      }
    } catch (error) {
      this.isAlertVisible = false
    }
  }
}
