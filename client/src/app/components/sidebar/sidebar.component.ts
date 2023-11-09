import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { groupSelected } from 'src/state/actions';
import { selectGroups } from 'src/state/selectors';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  groups$ = this.store.select(selectGroups)
  isSidebarExpanded = false;

  constructor(private store: Store) {}

  getLabel(selection: any) {
    return selection?.item?.labl || "<NO LABEL ON GROUP>"
  }

  changeGroup(selection: any | string) {
    if (selection === '') {
      this.store.dispatch(groupSelected({groupID: ''}))
    } else {
      const groupID = { groupID: selection.item['@_ID'] }
      // console.log(groupID)
      this.store.dispatch(groupSelected(groupID))
    }
  }
}
