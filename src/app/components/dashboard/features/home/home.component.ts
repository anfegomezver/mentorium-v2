import { Component, inject, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UsersService } from '../../../auth/data-access/users.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../ui/table/table.component';
import { RouterLink } from '@angular/router';
import { TaskService } from '../task.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  userProfile: any = null;
  email: string | null = null;

  taskService = inject(TaskService);
  tasks = this.taskService.getTasks;

  constructor(private auth: Auth, private usersService: UsersService) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user?.email) {
        this.email = user.email;
        await this.loadUserByEmail(user.email);
      } else {
        this.userProfile = null;
        this.email = null;
      }
    });
  }

  async loadUserByEmail(email: string) {
    try {
      const userProfile = await this.usersService.getUserByEmail(email);
      this.userProfile = userProfile ?? null;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async deleteTask(id: string) {
    try {
      await this.taskService.delete(id);
      toast.success('Tarea eliminada correctamente');
    } catch (error) {
      toast.error('Error eliminando la tarea');
      console.error(error);
    }
  }
}
