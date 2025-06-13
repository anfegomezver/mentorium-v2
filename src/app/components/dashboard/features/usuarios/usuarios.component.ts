import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Timestamp } from '@angular/fire/firestore';

interface Access {
  displayName: string;
  email: string;
  encryptedPassword?: string;
  loginAt: any; // Firestore Timestamp
  logoutAt: any;
  method: string;
  uidUser: string;
}

@Component({
  standalone: true,
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UsuariosComponent {
  private firestore: Firestore = inject(Firestore);
  access$: Observable<Access[]>;
  sortedAccess: Access[] = [];
  sortColumn: string = 'loginAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Funcionalidad del código 2
  searchDate: string = '';
  modalResults: Access[] = [];
  showModal = false;

  constructor() {
    const accessCollection = collection(this.firestore, 'access');
    this.access$ = collectionData(accessCollection) as Observable<Access[]>;

    this.access$.subscribe(access => {
      this.sortedAccess = [...access];
      this.sortData(this.sortColumn);
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

      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;

      if (column === 'loginAt' || column === 'logoutAt') {
        valueA = valueA?.toDate ? valueA.toDate().getTime() : 0;
        valueB = valueB?.toDate ? valueB.toDate().getTime() : 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return this.sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }

  async consultarPorFecha() {
    if (!this.searchDate) {
      await Swal.fire('Error', 'Debes ingresar una fecha para consultar.', 'warning');
      return;
    }

    // Obtener fecha en zona horaria local
    const [year, month, day] = this.searchDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local: 00:00:00
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Local: 23:59:59

    // Convertimos a Timestamp (Firestore siempre lo guarda como UTC, pero compara correctamente)
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const accessRef = collection(this.firestore, 'access');
    const q = query(accessRef, where('loginAt', '>=', startTimestamp), where('loginAt', '<=', endTimestamp));

    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await Swal.fire('Sin resultados', 'No se encontraron registros para la fecha seleccionada.', 'info');
        return;
      }

      const results: Access[] = [];
      snapshot.forEach(doc => {
        results.push(doc.data() as Access);
      });

      this.modalResults = results;
      this.showModal = true;

    } catch (error) {
      console.error(error);
      await Swal.fire('Error', 'Ocurrió un problema al consultar los datos.', 'error');
    }
  }



  cerrarModal() {
    this.showModal = false;
    this.modalResults = [];
  }

  // Opcional: si usas esta función en HTML
  formatDate(timestamp: any): string {
    return timestamp?.toDate().toLocaleString();
  }
}
