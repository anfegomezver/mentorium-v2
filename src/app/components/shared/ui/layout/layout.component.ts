import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { AuthStateService } from '../../data-access/auth-state.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, RouterLink],
  standalone: true,
  templateUrl: './layout.component.html'
})
export default class LayoutComponent {
  private _authState= inject( AuthStateService);
  private _router = inject(Router);

  async logOut() {
    await this._authState.logOut();
    toast.success('Hasta luego');
    console.clear();
    this._router.navigateByUrl('/auth/login');
     
  } 
}
