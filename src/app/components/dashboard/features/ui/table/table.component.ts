import { Component, effect, input } from '@angular/core';
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
}
