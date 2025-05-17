import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { toast } from 'ngx-sonner';

import { UsersService } from '../../../auth/data-access/users.service';
import { TaskService } from '../task.service';

import { TableComponent } from '../ui/table/table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  userProfile: any = null;
  email: string | null = null;

  // Servicios
  taskService = inject(TaskService);

  // Signal de tareas
  tasks = this.taskService.getTasks;

  constructor(
    private auth: Auth,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
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

  async loadUserByEmail(email: string): Promise<void> {
    try {
      const userProfile = await this.usersService.getUserByEmail(email);
      this.userProfile = userProfile ?? null;
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.taskService.delete(id);
      toast.success('Tarea eliminada correctamente');
    } catch (error) {
      toast.error('Error eliminando la tarea');
      console.error(error);
    }
  }
}
