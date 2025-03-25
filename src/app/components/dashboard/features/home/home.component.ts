import { Component, OnInit } from '@angular/core';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  email: string | null = null;
  displayName: string | null = null;

  constructor(private auth: Auth) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
        this.displayName = user.displayName ?? "No tiene nombre";
        console.log("Usuario autenticado:", this.displayName);
      } else {
        console.log("No hay usuario autenticado");
      }
    });
  }
}
