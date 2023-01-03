import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { LoginService } from '@pixvs/services/login.service';

import { VerificationComponent } from '@pixvs/modulos/acceso/verification/verification.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const routes = [
    {
        path     : '**',
        component: VerificationComponent
    }
];

@NgModule({
    declarations: [
        VerificationComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        
		TranslateModule,

        FuseSharedModule
    ],
	providers: [
		LoginService
	]
})
export class VerificationModule
{
}
