import { Component, effect, input } from '@angular/core';
import { Task } from '../../task.service';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  tasks = input.required<Task[]>();
}
