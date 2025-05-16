import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-facebook-button',
  templateUrl: './facebook-button.component.html',
})
export class FacebookButtonComponent {
  @Output() onClick = new EventEmitter<void>();
}
