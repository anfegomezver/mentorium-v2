import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { UsersService } from '../../../auth/data-access/users.service';
import { TaskService } from '../task.service';
import { TableComponent } from '../ui/table/table.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  userProfile: any = null;
  email: string | null = null;
  tasks = inject(TaskService).getTasks;

  private readonly LAST_ACTIVITY_KEY = 'lastActivityTimestamp';
  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private taskService = inject(TaskService);

  private inactivityTimeoutId: any;
  private readonly INACTIVITY_LIMIT_MS = 10000;
  private alertRunning = false;

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
        this.email = user.email;
        await this.loadUserByEmail(user.email);

        const lastActivityStr = localStorage.getItem(this.LAST_ACTIVITY_KEY);
        const now = Date.now();

        if (lastActivityStr) {
          const lastActivity = parseInt(lastActivityStr, 10);
          const timeElapsed = now - lastActivity;

          if (timeElapsed >= this.INACTIVITY_LIMIT_MS) {
            await this.showInactivityAlert();
            return;
          }
        }

        this.startInactivityTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopInactivityTimer();
  }

  private async loadUserByEmail(email: string): Promise<void> {
    try {
      this.userProfile = await this.usersService.getUserByEmail(email);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.taskService.delete(id);
    } catch (error) {
      console.error('Error eliminando la tarea:', error);
    }
  }

  private startInactivityTimer(): void {
    this.alertRunning = true;
    localStorage.setItem('alertRunning', 'true');
    this.resetInactivityTimer();

    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
    window.addEventListener('click', this.resetInactivityTimer);
  }

  private stopInactivityTimer(): void {
    this.alertRunning = false;
    localStorage.removeItem('alertRunning');
    clearTimeout(this.inactivityTimeoutId);

    window.removeEventListener('mousemove', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    window.removeEventListener('click', this.resetInactivityTimer);
  }

  private resetInactivityTimer = (): void => {
    clearTimeout(this.inactivityTimeoutId);

    const now = Date.now();
    localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());

    this.inactivityTimeoutId = setTimeout(async () => {
      const lastActivity = parseInt(localStorage.getItem(this.LAST_ACTIVITY_KEY) || '0', 10);
      const timeElapsed = Date.now() - lastActivity;

      if (this.alertRunning && timeElapsed >= this.INACTIVITY_LIMIT_MS) {
        await this.showInactivityAlert();
      }
    }, this.INACTIVITY_LIMIT_MS);
  };

  private async showInactivityAlert(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eres tú? No se ha detectado actividad reciente',
      text: `Sesión iniciada como ${this.userProfile?.name || 'usuario'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, mantener sesión',
      cancelButtonText: 'No, cerrar sesión',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (result.isConfirmed) {
      this.resetInactivityTimer();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      await this.logout();
    }
  }

  private async logout(): Promise<void> {
    this.stopInactivityTimer();
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
    localStorage.removeItem('alertRunning');

    await this.auth.signOut();
    toast.success('Hasta luego');
    console.clear();
    this.router.navigate(['/auth/login']);
  }
}