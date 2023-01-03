import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { LoginService } from '@pixvs/services/login.service';

import { FuseSharedModule } from '@fuse/shared.module';

import { ForgotPasswordComponent } from '@pixvs/modulos/acceso/forgot-password/forgot-password.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes = [
    {
        path     : '**',
        component: ForgotPasswordComponent
    }
];

@NgModule({
    declarations: [
        ForgotPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,

		TranslateModule,

        FuseSharedModule
    ],
	providers: [
		LoginService
	]
})
export class ForgotPasswordModule
{
}
