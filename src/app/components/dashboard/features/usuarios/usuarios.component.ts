import { Component, inject, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import localeEs from '@angular/common/locales/es';

// Registrar el locale español
registerLocaleData(localeEs);

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
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
})
export class UsuariosComponent {
  private firestore: Firestore = inject(Firestore);
  access$: Observable<Access[]>;
  sortedAccess: Access[] = [];
  filteredAccess: Access[] = [];
  paginatedAccess: Access[] = [];
  sortColumn = 'loginAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Estados de carga
  isLoading = false;
  isModalLoading = false;
  isClosingModal = false;

  // Búsqueda avanzada
  showAdvancedSearch = false;
  searchByName = false;
  searchByEmail = false;
  searchByDate = false;
  searchText = '';
  searchDate = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  totalItems = 0;
  itemsPerPageOptions = [5, 10, 25, 50];

  // Modal
  consultaFecha = '';
  modalResults: Access[] = [];
  showModal = false;

  constructor() {
    this.isLoading = true;
    const accessCollection = collection(this.firestore, 'access');
    this.access$ = collectionData(accessCollection) as Observable<Access[]>;

    this.access$.subscribe((access) => {
      this.sortedAccess = [...access];
      this.sortData(this.sortColumn);
      this.filteredAccess = [...this.sortedAccess];
      this.updatePagination();
      this.isLoading = false;
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

      // Lógica especial para logoutAt - sesiones activas SIEMPRE primero
      if (column === 'logoutAt') {
        const hasLogoutA = valueA !== null && valueA !== undefined;
        const hasLogoutB = valueB !== null && valueB !== undefined;

        // Si uno tiene logout y el otro no, sesiones activas SIEMPRE primero
        if (hasLogoutA !== hasLogoutB) {
          return hasLogoutA ? 1 : -1; // Sin logout (sesión activa) SIEMPRE primero
        }

        // Si ambos tienen logout, ordenar por fecha
        if (hasLogoutA && hasLogoutB) {
          valueA = valueA.toDate().getTime();
          valueB = valueB.toDate().getTime();
        } else if (!hasLogoutA && !hasLogoutB) {
          return 0; // Ambos son sesiones activas, mantener orden
        }
      } else if (column === 'loginAt') {
        // Para loginAt, manejar timestamps normalmente
        valueA = valueA?.toDate ? valueA.toDate().getTime() : 0;
        valueB = valueB?.toDate ? valueB.toDate().getTime() : 0;
      }

      // Manejar valores nulos/undefined para otras columnas
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;

      // Ordenamiento para strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Ordenamiento para números
      return this.sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
    this.applyFilters();
  }

  async consultarPorFecha() {
    if (!this.consultaFecha) {
      await Swal.fire({
        title: 'Fecha requerida',
        text: 'Por favor selecciona una fecha para realizar la consulta.',
        icon: 'warning',
        confirmButtonColor: '#3a8a9c',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    this.isModalLoading = true;

    try {
      // Obtener fecha en zona horaria local
      const [year, month, day] = this.consultaFecha.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      // Convertimos a Timestamp
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const accessRef = collection(this.firestore, 'access');
      const q = query(
        accessRef,
        where('loginAt', '>=', startTimestamp),
        where('loginAt', '<=', endTimestamp)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this.isModalLoading = false;
        await Swal.fire({
          title: 'Sin resultados',
          text: 'No se encontraron registros de acceso para la fecha seleccionada.',
          icon: 'info',
          confirmButtonColor: '#3a8a9c',
          confirmButtonText: 'Entendido',
        });
        return;
      }

      const results: Access[] = [];
      snapshot.forEach((doc) => {
        results.push(doc.data() as Access);
      });

      // Ordenar resultados por fecha de login
      results.sort((a, b) => {
        const timeA = a.loginAt?.toDate ? a.loginAt.toDate().getTime() : 0;
        const timeB = b.loginAt?.toDate ? b.loginAt.toDate().getTime() : 0;
        return timeB - timeA; // Más reciente primero
      });

      this.modalResults = results;
      this.isModalLoading = false;
      this.showModal = true;
    } catch (error) {
      this.isModalLoading = false;
      console.error(error);
      await Swal.fire({
        title: 'Error en la consulta',
        text: 'Ocurrió un problema al consultar los registros. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#3a8a9c',
        confirmButtonText: 'Entendido',
      });
    }
  }

  async cerrarModal() {
    this.isClosingModal = true;

    // Animación suave de cierre
    await new Promise((resolve) => setTimeout(resolve, 200));

    this.showModal = false;
    this.modalResults = [];
    this.isClosingModal = false;
  }

  applyFilters() {
    if (!this.isSearchActive()) {
      this.filteredAccess = [...this.sortedAccess];
      this.updatePagination();
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
    this.currentPage = 1; // Reset a la primera página
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.filteredAccess.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Asegurar que currentPage esté en rango válido
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAccess = this.filteredAccess.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  changeItemsPerPage(newSize: number) {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
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

  getMethodDisplayName(method: string): string {
    const methodNames: { [key: string]: string } = {
      email: 'Email/Contraseña',
      google: 'Google',
      github: 'GitHub',
      facebook: 'Facebook',
    };
    return methodNames[method] || method;
  }

  getPaginationInfo(): string {
    if (this.totalItems === 0) return 'No hay registros';

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    return `Mostrando ${start}-${end} de ${this.totalItems} registros`;
  }
}