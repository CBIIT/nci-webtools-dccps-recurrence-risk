import { NgModule } from '@angular/core';
import { CovalentFileModule } from '@covalent/core/file';
import {
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSliderModule,
  MatIconModule,
  MatDividerModule,
  MatTabsModule,
  MatTableModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSortModule
} from '@angular/material';

@NgModule({
    exports: [
        CovalentFileModule,
        MatToolbarModule,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatDividerModule,
        MatIconModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSortModule
    ]
})
export class AppMaterialModule {}