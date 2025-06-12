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
  templateUrl: './layout.component.html'
})
export default class LayoutComponent implements OnInit, OnDestroy {
  private _authState = inject(AuthStateService);
  private _router = inject(Router);
  private accessService = inject(AccessService);
  private auth = inject(Auth);
  
  private inactivityTimeoutId: any = null;
  private readonly INACTIVITY_LIMIT_MS = 30 * 1000; //TIEMPO DE INACTIVIDAD - SE AJUSTA PARA PRUEBAS
  private alertRunning = false;
  private isAlertVisible = false;
  private lastActivityTime = 0;
  private initialAuthCheck = false;

  ngOnInit(): void {
    this.startTimer();
    
    onAuthStateChanged(this.auth, async (user) => {
      if (!this.initialAuthCheck) {
        this.initialAuthCheck = true;
        return;
      }
      if (!user?.email && this.alertRunning) {
        this.stopTimer();
        this._router.navigateByUrl('/auth/login');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  async logOut() {
    this.stopTimer();

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

  private startTimer(): void {
    if (this.alertRunning) {
      return;
    }
    this.alertRunning = true;
    this.lastActivityTime = Date.now();
    
    this.addEventListeners();
    this.scheduleCheck();
  }

  private stopTimer(): void {
    this.alertRunning = false;
    this.isAlertVisible = false;

    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }

    this.removeEventListeners();
  }

  private addEventListeners(): void {
    document.addEventListener('mousemove', this.handleActivity);
    document.addEventListener('keydown', this.handleActivity);
    document.addEventListener('click', this.handleActivity);
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.handleActivity);
    document.removeEventListener('keydown', this.handleActivity);
    document.removeEventListener('click', this.handleActivity);
  }

  private handleActivity = (): void => {
    if (!this.alertRunning || this.isAlertVisible) return;
    this.lastActivityTime = Date.now();
    this.scheduleCheck();
  };

  private scheduleCheck(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }

    this.inactivityTimeoutId = setTimeout(() => {
      this.checkInactivity();
    }, this.INACTIVITY_LIMIT_MS);
  }

  private async checkInactivity(): Promise<void> {
    if (!this.alertRunning || this.isAlertVisible) {
      return;
    }
    const timeElapsed = Date.now() - this.lastActivityTime;

    if (timeElapsed >= this.INACTIVITY_LIMIT_MS) {
      await this.showAlert();
    } else {
      const remaining = this.INACTIVITY_LIMIT_MS - timeElapsed;
      this.inactivityTimeoutId = setTimeout(() => {
        this.checkInactivity();
      }, remaining);
    }
  }

  private async showAlert(): Promise<void> {
    if (this.isAlertVisible) {
      return;
    }
    this.isAlertVisible = true;
    
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
      this.inactivityTimeoutId = null;
    }

    try {
      const user = this.auth.currentUser;
      
      const result = await Swal.fire({
        title: '¿Sigues ahí?',
        text: `No se detectó actividad. Usuario: ${user?.displayName ?? 'Sin nombre'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cerrar sesión',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      this.isAlertVisible = false;

      if (result.isConfirmed) {
        this.lastActivityTime = Date.now();
        this.scheduleCheck();
      } else {
        await this.logOut();
      }
    } catch (error) {
      this.isAlertVisible = false;
    }
  }
}