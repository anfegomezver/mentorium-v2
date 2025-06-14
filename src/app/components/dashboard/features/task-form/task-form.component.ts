import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  type TaskCreate,
  TaskService,
} from '../../data-access/task/task.service';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
import type { Task } from '../../data-access/task/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export default class TaskFormComponent {
  private _formBuilder = inject(FormBuilder);
  private _taskService = inject(TaskService);
  private _router = inject(Router);

  idTask = input.required<string>();
  loading = signal(false);
  loadingTask = signal(false);

  form = this._formBuilder.group({
    title: this._formBuilder.control('', Validators.required),
    completed: this._formBuilder.control(false, Validators.required),
  });

  async submit() {
    if (this.form.invalid) return;

    try {
      this.loading.set(true);

      const { title, completed } = this.form.value;
      const task: TaskCreate = {
        title: title || '',
        completed: !!completed,
      };

      const id = this.idTask();

      if (id) {
        await this._taskService.update(task, id);
        toast.success('Tarea actualizada correctamente');
      } else {
        await this._taskService.create(task);
        toast.success('Tarea creada correctamente');
      }

      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      toast.error('Ocurrió un problema al guardar la tarea');
    } finally {
      this.loading.set(false);
    }
  }

  constructor() {
    effect(() => {
      console.log(this.idTask());

      const id = this.idTask();

      if (id) {
        this.getTask(id);
      }
    });
  }

  async getTask(id: string) {
    try {
      this.loadingTask.set(true);
      const taskSnapshot = await this._taskService.getTask(id);

      if (!taskSnapshot.exists()) {
        toast.error('Tarea no encontrada');
        this._router.navigateByUrl('/dashboard');
        return;
      }

      const task = taskSnapshot.data() as Task;
      this.form.patchValue(task);
    } catch (error) {
      toast.error('Error al cargar la tarea');
      this._router.navigateByUrl('/dashboard');
    } finally {
      this.loadingTask.set(false);
    }
  }
}