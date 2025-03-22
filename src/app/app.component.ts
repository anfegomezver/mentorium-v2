import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'
import { NgxSonnerToaster } from 'ngx-sonner';
import { AuthStateService } from './components/shared/data-access/auth-state.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html'
})
export class AppComponent {
  
  private _authState= inject( AuthStateService);
  private _router = inject(Router);

  async logOut() {
    await this._authState.logOut();
    this._router.navigateByUrl('/auth/login'); 
  } 
}
