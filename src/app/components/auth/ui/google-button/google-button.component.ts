import { Component, output } from '@angular/core';

@Component({
  selector: 'app-google-button',
  imports: [],
  templateUrl: './google-button.component.html'
})
export class GoogleButtonComponent {


  onClick = output<void>();
}
