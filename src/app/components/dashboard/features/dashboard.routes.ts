import { Routes } from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'new',
        loadComponent: () => import('./task-form/task-form.component')
    },
    {
        path: 'edit/:idTask',
        loadComponent: () => import('./task-form/task-form.component')
    }
] as Routes;
