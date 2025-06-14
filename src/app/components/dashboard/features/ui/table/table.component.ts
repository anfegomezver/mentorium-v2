import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import type { Task } from '../../../data-access/task/task.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  tasks = input.required<Task[]>();
  deletingTaskId = signal<string | null>(null);

  @Output() onDelete = new EventEmitter<string>();

  async deleteTask(id: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      this.deletingTaskId.set(id);
      this.onDelete.emit(id); // Emite el id al componente padre (HomeComponent)

      // Reset después de un tiempo para limpiar el estado
      setTimeout(() => {
        this.deletingTaskId.set(null);
      }, 2000);
    }
  }

  isDeleting(taskId: string): boolean {
    return this.deletingTaskId() === taskId;
  }
}