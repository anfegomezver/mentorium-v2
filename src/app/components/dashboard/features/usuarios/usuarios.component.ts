import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

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
  imports: [CommonModule]
})
export class UsuariosComponent {
  private firestore: Firestore = inject(Firestore);
  access$: Observable<Access[]>;
  sortedAccess: Access[] = [];
  sortColumn: string = 'loginAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor() {
    const accessCollection = collection(this.firestore, 'access');
    this.access$ = collectionData(accessCollection) as Observable<Access[]>;
    
    this.access$.subscribe(access => {
      this.sortedAccess = [...access];
      this.sortData(this.sortColumn); // Orden inicial
    });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sortedAccess.sort((a, b) => {
      let valueA = a[column as keyof Access];
      let valueB = b[column as keyof Access];

      // Manejo de valores undefined/null
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;

      // Manejo especial para fechas (Firestore Timestamp)
      if (column === 'loginAt' || column === 'logoutAt') {
        valueA = valueA?.toDate ? valueA.toDate().getTime() : 0;
        valueB = valueB?.toDate ? valueB.toDate().getTime() : 0;
      }

      // Comparación para strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Comparación para números/fechas
      return this.sortDirection === 'asc' 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }

  // Función para formatear fechas (opcional, ahora se usa el pipe date en el HTML)
  formatDate(timestamp: any): string {
    return timestamp?.toDate().toLocaleString();
  }
}