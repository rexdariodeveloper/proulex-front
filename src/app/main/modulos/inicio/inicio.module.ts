import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { MatIconModule } from '@angular/material/icon';


import { InicioComponent } from './inicio.component';
import { AuthGuard } from '@app/guards';

const routes = [
    {
        path: '',
        component: InicioComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    declarations: [
        InicioComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        TranslateModule,
        FuseSharedModule,

        MatIconModule
    ],
    exports: [
        InicioComponent
    ]
})

export class InicioModule {
}
