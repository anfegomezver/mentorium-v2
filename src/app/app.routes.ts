import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './components/core/auth.guard';


export const routes: Routes = [
    {
        canActivateChild: [publicGuard()],
        path: 'auth',
        loadChildren: () => import('./components/auth/features/auth.routes'),
    },
    {
        canActivateChild: [privateGuard()],
        path: 'dashboard',
        loadChildren: () => import('./components/dashboard/features/dashboard.routes'),
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
    
];