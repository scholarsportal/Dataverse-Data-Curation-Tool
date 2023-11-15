import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDatasetTitle } from 'src/state/selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title$ = this.store.select(selectDatasetTitle);
  data: any;

  constructor(private store: Store) {}
}
