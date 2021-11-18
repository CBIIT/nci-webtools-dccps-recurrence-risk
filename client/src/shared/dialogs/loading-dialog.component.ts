import { Inject, Component} from '@angular/core';

import { MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'loading-dialog',
   template:`
     <h1 mat-dialog-title>Loading...</h1>
     <div fxLayout="column" fxLayoutAlign="start stretch">
       <mat-spinner></mat-spinner>
     </div>
   `
})
export class LoadingDialogComponent {
  constructor(public dialogRef: MatDialogRef<LoadingDialogComponent>) {
    dialogRef.disableClose = true;
  }
}
