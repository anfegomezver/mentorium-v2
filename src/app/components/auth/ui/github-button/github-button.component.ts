import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-github-button',
  templateUrl: './github-button.component.html',
})
export class GithubButtonComponent {
  @Output() onClick = new EventEmitter<void>();
}
