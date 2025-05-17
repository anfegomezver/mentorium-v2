import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskCreate, TaskService } from '../task.service';
import { toast } from 'ngx-sonner';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export default class TaskFormComponent {
  private _formBuilder = inject(FormBuilder);
  private _taskService = inject(TaskService);
  private _router = inject(Router);

  form = this._formBuilder.group({
    title: this._formBuilder.control('', Validators.required),
    completed: this._formBuilder.control('false', Validators.required)
  });
  
  async submit(){
    if(this.form.invalid) return;

    try{
      const {title, completed} = this.form.value;
      const task: TaskCreate = {
        title: title || '',
        completed: !!completed, 
      };

      await this._taskService.create(task);

      toast.success('Tarea creada correctamente');
      this._router.navigateByUrl('/dashboard')

    } catch (error){
      toast.success('Ocurrio un problema');
    }
  }
}
