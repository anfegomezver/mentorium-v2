import { Component, inject, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UsersService } from '../../../auth/data-access/users.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../ui/table/table.component';
import { RouterLink, Router } from '@angular/router';
import { TaskService } from '../task.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  userProfile: any = null;
  email: string | null = null;

  tasks = inject(TaskService).getTasks;
  private router = inject(Router);
  private auth = inject(Auth);
  private usersService = inject(UsersService);

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user && user.email) {
        this.email = user.email;
        await this.loadUserByEmail(user.email);

        const result = await Swal.fire({
          title: `Hola, ${user.email}`,
          text: '¿Quieres mantener la sesión o cerrarla?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Mantener sesión',
          cancelButtonText: 'Cerrar sesión',
        });

        if (!result.isConfirmed) {
          await this.auth.signOut();
          this.router.navigate(['/auth/login']);
        }
      } else {
        this.userProfile = null;
        this.email = null;
        this.router.navigate(['/auth/login']);
      }
    });
  }

  async loadUserByEmail(email: string) {
    try {
      const userProfile = await this.usersService.getUserByEmail(email);
      if (userProfile) {
        this.userProfile = userProfile;
        console.log('Usuario recuperado:', this.userProfile);
      } else {
        console.log('No se encontró usuario con ese email');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }
}
