import { Component, type OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Auth,
  onAuthStateChanged,
  linkWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import Swal from 'sweetalert2';
import {
  UsersService,
  type AuthProvider,
} from '../../../auth/data-access/users/users.service';
import { TaskService } from '../../data-access/task/task.service';
import { TableComponent } from '../ui/table/table.component';
import { toast } from 'ngx-sonner';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  userProfile: any = null;
  email: string | null = null;
  tasks = inject(TaskService).getTasks;
  currentUser: any = null;

  // Loading states
  isLoadingGoogle = signal(false);
  isLoadingFacebook = signal(false);
  isLoadingGitHub = signal(false);
  isLoadingPassword = signal(false);
  isLoadingDelete = signal(false);

  private auth = inject(Auth);
  private usersService = inject(UsersService);
  private taskService = inject(TaskService);

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
        this.currentUser = user;
        this.email = user.email;
        await this.loadUserByEmail(user.email);
      }
    });
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
      this.isLoadingDelete.set(true);
      await this.taskService.delete(id);
      toast.success('Tarea eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando la tarea:', error);
      toast.error('Error al eliminar la tarea');
    } finally {
      this.isLoadingDelete.set(false);
    }
  }

  async linkGoogle(): Promise<void> {
    if (!this.currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      this.isLoadingGoogle.set(true);

      const isAlreadyLinked = await this.usersService.isProviderLinked(
        this.currentUser.uid,
        'google.com'
      );

      if (isAlreadyLinked) {
        toast.info('Google ya vinculado');
        return;
      }

      const googleProvider = new GoogleAuthProvider();
      const result = await linkWithPopup(this.currentUser, googleProvider);

      const provider: AuthProvider = {
        providerId: 'google.com',
        displayName: 'Google',
        providerDisplayName: result.user.displayName || result.user.email || '',
        linkedAt: Timestamp.now(),
      };

      await this.usersService.addProviderToUser(this.currentUser.uid, provider);
      await this.loadUserByEmail(this.email!);

      toast.success('¡Google vinculado exitosamente!');
    } catch (error: any) {
      toast.error('Error al vincular Google');
    } finally {
      this.isLoadingGoogle.set(false);
    }
  }

  async linkFacebook(): Promise<void> {
    if (!this.currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      this.isLoadingFacebook.set(true);

      const isAlreadyLinked = await this.usersService.isProviderLinked(
        this.currentUser.uid,
        'facebook.com'
      );

      if (isAlreadyLinked) {
        toast.info('Facebook ya vinculado');
        return;
      }

      const facebookProvider = new FacebookAuthProvider();
      facebookProvider.addScope('email');
      facebookProvider.addScope('public_profile');

      const result = await linkWithPopup(this.currentUser, facebookProvider);

      const provider: AuthProvider = {
        providerId: 'facebook.com',
        displayName: 'Facebook',
        providerDisplayName: result.user.displayName || result.user.email || '',
        linkedAt: Timestamp.now(),
      };

      await this.usersService.addProviderToUser(this.currentUser.uid, provider);
      await this.loadUserByEmail(this.email!);

      toast.success('¡Facebook vinculado exitosamente!');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permite popups para Facebook');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Popup cerrado. Intenta de nuevo');
      } else if (
        error.code === 'auth/account-exists-with-different-credential'
      ) {
        toast.error(
          'Esta cuenta de Facebook ya está asociada con otro usuario'
        );
      } else {
        toast.error(`Error al vincular Facebook: ${error.message}`);
      }
    } finally {
      this.isLoadingFacebook.set(false);
    }
  }

  async linkGitHub(): Promise<void> {
    if (!this.currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      this.isLoadingGitHub.set(true);

      const isAlreadyLinked = await this.usersService.isProviderLinked(
        this.currentUser.uid,
        'github.com'
      );

      if (isAlreadyLinked) {
        toast.info('GitHub ya vinculado');
        return;
      }

      const githubProvider = new GithubAuthProvider();
      const result = await linkWithPopup(this.currentUser, githubProvider);

      const provider: AuthProvider = {
        providerId: 'github.com',
        displayName: 'GitHub',
        providerDisplayName: result.user.displayName || result.user.email || '',
        linkedAt: Timestamp.now(),
      };

      await this.usersService.addProviderToUser(this.currentUser.uid, provider);
      await this.loadUserByEmail(this.email!);

      toast.success('¡GitHub vinculado exitosamente!');
    } catch (error: any) {
      toast.error('Error al vincular GitHub');
    } finally {
      this.isLoadingGitHub.set(false);
    }
  }

  async linkPassword(): Promise<void> {
    if (!this.currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    try {
      const isAlreadyLinked = await this.usersService.isProviderLinked(
        this.currentUser.uid,
        'password'
      );

      if (isAlreadyLinked) {
        toast.info('Email/Password ya configurado');
        return;
      }

      const { value: formValues } = await Swal.fire({
        title: '🔐 Vincular Email/Contraseña',
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
        confirmButtonText: 'Vincular',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        preConfirm: () => {
          const email = (
            document.getElementById('swal-input-email') as HTMLInputElement
          ).value;
          const password = (
            document.getElementById('swal-input-password') as HTMLInputElement
          ).value;
          const confirmPassword = (
            document.getElementById('swal-input-confirm') as HTMLInputElement
          ).value;

          if (!password) {
            Swal.showValidationMessage('La contraseña es requerida');
            return false;
          }

          if (password.length < 8) {
            Swal.showValidationMessage(
              'La contraseña debe tener al menos 8 caracteres'
            );
            return false;
          }

          if (
            !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(
              password
            )
          ) {
            Swal.showValidationMessage(
              'La contraseña debe contener mayúscula, minúscula, número y símbolo'
            );
            return false;
          }

          if (password !== confirmPassword) {
            Swal.showValidationMessage('Las contraseñas no coinciden');
            return false;
          }

          return { email, password };
        },
      });

      if (formValues) {
        this.isLoadingPassword.set(true);

        const credential = EmailAuthProvider.credential(
          formValues.email,
          formValues.password
        );
        await linkWithCredential(this.currentUser, credential);

        const provider: AuthProvider = {
          providerId: 'password',
          displayName: 'Email/Contraseña',
          providerDisplayName: formValues.email,
          linkedAt: Timestamp.now(),
        };

        await this.usersService.addProviderToUser(
          this.currentUser.uid,
          provider
        );
        await this.loadUserByEmail(this.email!);

        toast.success('¡Email/Password vinculado exitosamente!');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este email ya tiene una contraseña asociada');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña es muy débil');
      } else {
        toast.error('Error al vincular Email/Contraseña');
      }
    } finally {
      this.isLoadingPassword.set(false);
    }
  }

  isProviderLinked(providerId: string): boolean {
    return (
      this.userProfile?.providers?.some(
        (p: any) => p.providerId === providerId
      ) || false
    );
  }

  getLinkedProviders(): string[] {
    return this.userProfile?.providers?.map((p: any) => p.displayName) || [];
  }
}