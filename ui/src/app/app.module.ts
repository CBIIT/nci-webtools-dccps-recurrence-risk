import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
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
import { AppComponent } from './app.component';
import { HeaderComponent,FooterComponent } from './common';
import { GroupComponent } from './group/group.component';
import { IndividualComponent, IndividualDialogComponent } from './individual/individual.component';
import { GroupHelpComponent } from './group/group-help/group-help.component';
import { IndividualHelpComponent } from './individual/individual-help/individual-help.component';
import { LoadingDialogComponent } from '../shared/dialogs/loading-dialog.component';

const appRoutes: Routes = [
  { path: 'individual', component: IndividualComponent },
  { path: 'group', component: GroupComponent },
  { path: '',   redirectTo: '/group', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    GroupComponent,
    IndividualComponent,
    IndividualDialogComponent,
    GroupHelpComponent,
    IndividualHelpComponent,
    LoadingDialogComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false,  // <-- debugging purposes only
        useHash: true
      }
    ),
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
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
  ],
  entryComponents: [IndividualDialogComponent, LoadingDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
