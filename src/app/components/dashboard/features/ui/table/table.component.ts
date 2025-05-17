import { Component, EventEmitter, Output, input } from '@angular/core';
import { Task } from '../../task.service';
import { RouterLink } from '@angular/router';

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

  deleteTask(id: string) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (confirmDelete) {
      this.onDelete.emit(id);
    }
  }
}
