import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Access {
  displayName: string;
  email: string;
  encryptedPassword?: string;
  loginAt: any; // Puede ser Date o Timestamp de Firebase
  logoutAt: any;
  method: string;
  uidUser: string;
}

@Component({
  standalone: true,
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [CommonModule] // Necesario para el pipe date
})
export class UsuariosComponent {
  private firestore: Firestore = inject(Firestore);
  access$: Observable<Access[]>;

  constructor() {
    const accessCollection = collection(this.firestore, 'access');
    this.access$ = collectionData(accessCollection) as Observable<Access[]>;
  }

  // Función para formatear fechas (opcional)
  formatDate(timestamp: any): string {
    return timestamp?.toDate().toLocaleString();
  }

}