import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./components/auth/features/auth.routes'),
    },
    
];