import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';

import { MailConfirmComponent } from '@pixvs/modulos/acceso/mail-confirm/mail-confirm.component';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '@services/login.service';

const routes = [
    {
        path     : '**',
        component: MailConfirmComponent
    }
];

@NgModule({
    declarations: [
        MailConfirmComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ],
    providers : [
        LoginService
    ]
})
export class MailConfirmModule
{
}
