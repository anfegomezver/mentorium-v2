import { AfterViewInit, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskCreate, TaskService } from '../task.service';
import { toast } from 'ngx-sonner';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import type { Task } from '../task.service';


@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export default class TaskFormComponent{
  private _formBuilder = inject(FormBuilder);
  private _taskService = inject(TaskService);
  private _router = inject(Router);

  idTask = input.required<string>();

  form = this._formBuilder.group({
    title: this._formBuilder.control('', Validators.required),
    completed: this._formBuilder.control(false, Validators.required)
  });
  
  async submit(){
    if(this.form.invalid) return;

    try{
      const {title, completed} = this.form.value;
      const task: TaskCreate = {
        title: title || '',
        completed: !!completed, 
      };

      const id = this.idTask();

      if(id) {
        await this._taskService.update(task, id);
      } else {
        await this._taskService.create(task);
      }

      toast.success(`Tarea ${id ? 'actualizada' : 'creada'} correctamente`);
      this._router.navigateByUrl('/dashboard')

    } catch (error){
      toast.success('Ocurrio un problema');
    }
  }

  constructor(){
    effect(() =>{
      console.log(this.idTask());

      const id = this.idTask();

      if(id){
        this.getTask(id);
      }
    });
  }

  async getTask(id : string){
    const taskSnapshot = await this._taskService.getTask(id);

    if(!taskSnapshot.exists()) return;

    const task = taskSnapshot.data() as Task;

    this.form.patchValue(task);
  }
}
