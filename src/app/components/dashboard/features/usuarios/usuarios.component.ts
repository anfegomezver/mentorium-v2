import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  getDocs,
  Timestamp,
} from '@angular/fire/firestore';
import type { Observable } from 'rxjs';
import Swal from 'sweetalert2';

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
  imports: [CommonModule, FormsModule],
})
export class UsuariosComponent {
  private firestore: Firestore = inject(Firestore);
  access$: Observable<Access[]>;
  sortedAccess: Access[] = [];
  filteredAccess: Access[] = [];
  sortColumn = 'loginAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  showAdvancedSearch = false;
  searchByName = false;
  searchByEmail = false;
  searchByDate = false;
  searchText = '';
  searchDate = '';

  consultaFecha = '';
  modalResults: Access[] = [];
  showModal = false;

  constructor() {
    const accessCollection = collection(this.firestore, 'access');
    this.access$ = collectionData(accessCollection) as Observable<Access[]>;

    this.access$.subscribe((access) => {
      this.sortedAccess = [...access];
      this.sortData(this.sortColumn);
      this.filteredAccess = [...this.sortedAccess];
    });
  }

  normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
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
    this.applyFilters();
  }

  async consultarPorFecha() {
    if (!this.consultaFecha) {
      await Swal.fire(
        'Error',
        'Debes ingresar una fecha para consultar.',
        'warning'
      );
      return;
    }

    // Obtener fecha en zona horaria local
    const [year, month, day] = this.consultaFecha.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local: 00:00:00
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // Local: 23:59:59

    // Convertimos a Timestamp (Firestore siempre lo guarda como UTC, pero compara correctamente)
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const accessRef = collection(this.firestore, 'access');
    const q = query(
      accessRef,
      where('loginAt', '>=', startTimestamp),
      where('loginAt', '<=', endTimestamp)
    );

    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await Swal.fire(
          'Sin resultados',
          'No se encontraron registros para la fecha seleccionada.',
          'info'
        );
        return;
      }

      const results: Access[] = [];
      snapshot.forEach((doc) => {
        results.push(doc.data() as Access);
      });

      this.modalResults = results;
      this.showModal = true;
    } catch (error) {
      console.error(error);
      await Swal.fire(
        'Error',
        'Ocurrió un problema al consultar los datos.',
        'error'
      );
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.modalResults = [];
  }

  applyFilters() {
    if (!this.isSearchActive()) {
      this.filteredAccess = [...this.sortedAccess];
      return;
    }

    let filtered = [...this.sortedAccess];

    if (this.searchByName && this.searchText.trim()) {
      const searchTextNormalized = this.normalizeText(this.searchText.trim());
      filtered = filtered.filter(
        (access) =>
          access.displayName &&
          this.normalizeText(access.displayName).includes(searchTextNormalized)
      );
    }

    if (this.searchByEmail && this.searchText.trim()) {
      const searchTextNormalized = this.normalizeText(this.searchText.trim());
      filtered = filtered.filter(
        (access) =>
          access.email &&
          this.normalizeText(access.email).includes(searchTextNormalized)
      );
    }

    if (this.searchByDate && this.searchDate) {
      const [year, month, day] = this.searchDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();

      filtered = filtered.filter((access) => {
        if (!access.loginAt || !access.loginAt.toDate) return false;
        const loginTime = access.loginAt.toDate().getTime();
        return loginTime >= startDate && loginTime <= endDate;
      });
    }

    this.filteredAccess = filtered;
  }

  clearSearch() {
    this.searchByName = false;
    this.searchByEmail = false;
    this.searchByDate = false;
    this.searchText = '';
    this.searchDate = '';
    this.applyFilters();
  }

  clearSearchText() {
    this.searchText = '';
    this.applyFilters();
  }

  clearSearchDate() {
    this.searchDate = '';
    this.applyFilters();
  }

  isSearchActive(): boolean {
    return (
      ((this.searchByName || this.searchByEmail) &&
        this.searchText.trim() !== '') ||
      (this.searchByDate && this.searchDate !== '')
    );
  }

  toggleSearchOption(option: 'name' | 'email'): void {
    if (option === 'name' && this.searchByName) {
      this.searchByEmail = false;
    } else if (option === 'email' && this.searchByEmail) {
      this.searchByName = false;
    }
    this.applyFilters();
  }

  formatDate(timestamp: any): string {
    return timestamp?.toDate().toLocaleString();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;

    if (!this.showAdvancedSearch) {
      this.clearSearch();
    }
  }
}