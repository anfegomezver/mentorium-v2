import { Component, EventEmitter, Output, input } from '@angular/core';
import { Task } from '../../../data-access/task/task.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-table',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  tasks = input.required<Task[]>();

  @Output() onDelete = new EventEmitter<string>();

  async deleteTask(id: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      this.onDelete.emit(id); // Emite el id al componente padre (HomeComponent)
    }
  }
}
