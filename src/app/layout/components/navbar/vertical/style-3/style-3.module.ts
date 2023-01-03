import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FuseNavigationModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarVerticalStyle3Component } from 'app/layout/components/navbar/vertical/style-3/style-3.component';

@NgModule({
    declarations: [
        NavbarVerticalStyle3Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        FuseSharedModule,
        FuseNavigationModule
    ],
    exports     : [
        NavbarVerticalStyle3Component
    ]
})
export class NavbarVerticalStyle3Module
{
}
