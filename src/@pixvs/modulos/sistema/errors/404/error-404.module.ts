import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';

import { Error404Component } from '@pixvs/modulos/sistema/errors/404/error-404.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

const routes = [
    {
        path     : 'errors/error-404',
        component: Error404Component
    }
];

@NgModule({
    declarations: [
        Error404Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatIconModule,
        
        TranslateModule,

        FuseSharedModule
    ]
})
export class Error404Module
{
}
