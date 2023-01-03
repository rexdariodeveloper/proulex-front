import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseConfirmDialogModule } from '@fuse/components';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioDatosAdicionalesService } from './usuario-datos-adicionales.service';
import { UsuarioDatosAdicionalesComponent } from './usuario-datos-adicionales.component';
import { PixvsMatTreeModule } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.module';


@NgModule({
    declarations: [
		UsuarioDatosAdicionalesComponent
	],
    imports: [
        CommonModule,
        RouterModule,

        MatFormFieldModule,

		TranslateModule,
		PixvsMatTreeModule,

        FuseConfirmDialogModule,
        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
		UsuarioDatosAdicionalesComponent
	],
	providers: [
		UsuarioDatosAdicionalesService
	]
})

export class UsuarioDatosAdicionalesModule {
}
