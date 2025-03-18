import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent , RegisterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Mentorium_v2';
}
