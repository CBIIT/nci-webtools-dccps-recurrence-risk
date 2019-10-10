import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRouterModule } from './router/app.router.module';
import { AppMaterialModule } from './app.material.module';

import { AppComponent } from './app.component';
import { HeaderComponent, FooterComponent } from './common';
import { GroupComponent } from './group/group.component';
import { IndividualComponent, IndividualDialogComponent } from './individual/individual.component';
import { GroupHelpComponent } from './group/group-help/group-help.component';
import { IndividualHelpComponent } from './individual/individual-help/individual-help.component';
import { LoadingDialogComponent } from '../shared/dialogs/loading-dialog.component';

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
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    AppRouterModule,
    AppMaterialModule,
  ],
  entryComponents: [
    IndividualDialogComponent,
    LoadingDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
