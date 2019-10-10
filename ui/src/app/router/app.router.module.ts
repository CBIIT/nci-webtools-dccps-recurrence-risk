import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { IndividualComponent } from '../individual/individual.component';
import { GroupComponent } from '../group/group.component';

export const appRoutes: Routes = [
    { path: 'individual', component: IndividualComponent },
    { path: 'group', component: GroupComponent },
    { path: '**',   redirectTo: '/group' }
];


@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {useHash: true}),
    ],
    providers: [
        {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}
    ],
    exports: [
        RouterModule,
    ]
})
export class AppRouterModule {}