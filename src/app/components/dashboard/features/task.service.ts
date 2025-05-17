import { inject, Injectable } from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop'
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskCreate = Omit<Task, 'id'>;

const PATH = 'tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _firestore = inject(Firestore);

  private _collection = collection(this._firestore, PATH);

  getTask = toSignal(
    collectionData(this._collection, {idField: 'id'}) as Observable<Task[]>, 
    {initialValue: []}
  );

  create(tasks : TaskCreate){
    return addDoc(this._collection, tasks)
  }
}
