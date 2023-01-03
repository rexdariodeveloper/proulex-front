import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';

const routes = [
    {
        path: 'login',
        loadChildren: () => import('@pixvs/modulos/acceso/login/login.module').then(m => m.LoginModule)
    }, {
        path: 'register',
        loadChildren: () => import('@pixvs/modulos/acceso/register/register.module').then(m => m.RegisterModule)
    }, {
        path: 'forgot-password',
        loadChildren: () => import('@pixvs/modulos/acceso/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
    }, {
        path: 'reset-password',
        loadChildren: () => import('@pixvs/modulos/acceso/reset-password/reset-password.module').then(m => m.ResetPasswordModule)
    }, {
        path: 'lock',
        loadChildren: () => import('@pixvs/modulos/acceso/lock/lock.module').then(m => m.LockModule)
    }, {
        path: 'mail-confirm',
        loadChildren: () => import('@pixvs/modulos/acceso/mail-confirm/mail-confirm.module').then(m => m.MailConfirmModule)
    }, {
        path: 'verification',
        loadChildren: () => import('@pixvs/modulos/acceso/verification/verification.module').then(m => m.VerificationModule)
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        FuseSharedModule
    ]
})

export class AccesoModule {

}
