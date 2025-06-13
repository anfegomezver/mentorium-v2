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
        path: 'users',
        loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent)
    },
    {
        path: 'edit/:idTask',
        loadComponent: () => import('./task-form/task-form.component')
    }
] as Routes;
