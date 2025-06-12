import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { AuthStateService } from '../../data-access/auth-state.service';
import { toast } from 'ngx-sonner';
import { AccessService } from '../../../auth/data-access/access/access.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, RouterLink, CommonModule],
  standalone: true,
  templateUrl: './layout.component.html',
})
export default class LayoutComponent implements OnInit, OnDestroy {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  private accessService = inject(AccessService);
  private auth = inject(Auth);

  private readonly LAST_ACTIVITY_KEY = 'lastActivityTimestamp';
  private inactivityTimeoutId: any = null;
  private readonly INACTIVITY_LIMIT_MS = 5 * 1000; //TIEMPO DE INACTIVIDAD - SE AJUSTA A GUSTO PARA PRUEBAS
  private alertRunning = false;
  private eventListenersAdded = false;
  private isAlertVisible = false;

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
        if (!this.alertRunning) {
          this.startInactivityTimer();
        }
      }
    });

    const wasAlertRunning = localStorage.getItem('alertRunning') === 'true';
    if (wasAlertRunning) {
      this.startInactivityTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopInactivityTimer();
  }

  async logOut() {
    this.stopInactivityTimer();
    localStorage.removeItem('lastActivityTimestamp');
    localStorage.removeItem('alertRunning');

    const docId = localStorage.getItem('docId');
    if (docId) {
      await this.accessService.registerLogout(docId);
      localStorage.removeItem('docId');
    }

    await this._authState.logOut();
    toast.success('Hasta luego');
    console.clear();
    this._router.navigateByUrl('/auth/login');
  }

  private startInactivityTimer(): void {
    if (this.alertRunning) return;

    this.alertRunning = true;
    localStorage.setItem('alertRunning', 'true');

    this.updateLastActivity();

    if (!this.eventListenersAdded) {
      this.addEventListeners();
      this.eventListenersAdded = true;
    }
    this.scheduleInactivityCheck();
  }

  private stopInactivityTimer(): void {
    this.alertRunning = false;
    this.isAlertVisible = false;
    localStorage.removeItem('alertRunning');

    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }

    this.removeEventListeners();
    this.eventListenersAdded = false;
  }

  private addEventListeners(): void {
    window.addEventListener('mousemove', this.handleUserActivity);
    window.addEventListener('keydown', this.handleUserActivity);
    window.addEventListener('click', this.handleUserActivity);
    window.addEventListener('scroll', this.handleUserActivity);
    window.addEventListener('touchstart', this.handleUserActivity);
  }

  private removeEventListeners(): void {
    window.removeEventListener('mousemove', this.handleUserActivity);
    window.removeEventListener('keydown', this.handleUserActivity);
    window.removeEventListener('click', this.handleUserActivity);
    window.removeEventListener('scroll', this.handleUserActivity);
    window.removeEventListener('touchstart', this.handleUserActivity);
  }

  private handleUserActivity = (): void => {
    if (!this.alertRunning || this.isAlertVisible) return;

    this.updateLastActivity();
    this.scheduleInactivityCheck();
  };

  private updateLastActivity(): void {
    const now = Date.now();
    localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());
  }

  private scheduleInactivityCheck(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }

    this.inactivityTimeoutId = setTimeout(() => {
      this.checkInactivity();
    }, this.INACTIVITY_LIMIT_MS);
  }

  private async checkInactivity(): Promise<void> {
    if (!this.alertRunning || this.isAlertVisible) return;

    const lastActivity = Number.parseInt(
      localStorage.getItem(this.LAST_ACTIVITY_KEY) || '0',
      10
    );
    const timeElapsed = Date.now() - lastActivity;

    if (timeElapsed >= this.INACTIVITY_LIMIT_MS) {
      await this.showInactivityAlert();
    } else {
      const remainingTime = this.INACTIVITY_LIMIT_MS - timeElapsed;
      this.inactivityTimeoutId = setTimeout(() => {
        this.checkInactivity();
      }, remainingTime);
    }
  }

  private async showInactivityAlert(): Promise<void> {
    if (this.isAlertVisible) return;

    this.isAlertVisible = true;

    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }

    const user = this.auth.currentUser;

    try {
      if (Swal.isVisible()) {
        Swal.close();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const result = await Swal.fire({
        title: `¿Sigues ahí?`,
        text: `No se detectó actividad. Usuario logeado: ${
          user?.displayName ?? ''
        }`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cerrar sesión',
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: undefined,
        timerProgressBar: false,
        backdrop: true,
        heightAuto: false,
      });

      this.isAlertVisible = false;

      if (result.isConfirmed) {
        this.updateLastActivity();
        localStorage.setItem('alertRunning', 'true');
        this.scheduleInactivityCheck();
      } else if (result.isDismissed) {
        await this.logOut();
      }
    } catch (error) {
      this.isAlertVisible = false;
    }
  }
}