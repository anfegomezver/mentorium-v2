import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { AuthStateService } from '../../data-access/auth-state.service';
import { toast } from 'ngx-sonner';
import { AccessService } from '../../../auth/data-access/access/access.service';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, RouterLink],
  standalone: true,
  templateUrl: './layout.component.html'
})
export default class LayoutComponent {
  private _authState= inject( AuthStateService);
  private _router = inject(Router);
  private accessService = inject(AccessService);

  async logOut() {
  // Limpia la actividad de inactividad al hacer logout
  localStorage.removeItem('lastActivityTimestamp');
  localStorage.removeItem('alertRunning');

  const docId = localStorage.getItem("accessDocId");
  if (docId) {
    await this.accessService.registerLogout(docId);
    localStorage.removeItem("accessDocId");
  }

  await this._authState.logOut();
  toast.success('Hasta luego');
  console.clear();
  this._router.navigateByUrl('/auth/login');
}

}
