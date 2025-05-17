import { Component, inject, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UsersService } from '../../../auth/data-access/users.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../ui/table/table.component';
import { RouterLink } from '@angular/router';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TableComponent, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  userProfile: any = null;
  email: string | null = null;

  tasks = inject(TaskService).getTasks;

  constructor(private auth: Auth, private usersService: UsersService) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user && user.email) {
        this.email = user.email;

        // Recuperar usuario por email
        await this.loadUserByEmail(user.email);
      } else {
        this.userProfile = null;
        this.email = null;
      }
    });

  }

  // Cargar usuario por email
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
      console.error('Error:', error);
    }
  }
}
