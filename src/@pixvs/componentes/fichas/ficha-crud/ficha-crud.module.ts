import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseConfirmDialogModule } from '@fuse/components';
import { FichaCrudComponent } from './ficha-crud.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FichaCrudHistorialComponent } from './ficha-crud-historial.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { PixvsConfirmComentarioDialogModule } from '@pixvs/componentes/confirm-comentario-dialog/confirm-comentario-dialog.module';


@NgModule({
    declarations: [FichaCrudComponent, FichaCrudHistorialComponent],
    imports: [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatListModule,
        MatSidenavModule,
        MatExpansionModule,
        
        MatBottomSheetModule,

        TranslateModule,

        FuseConfirmDialogModule,
        FuseSharedModule,
        FuseHighlightModule,

		PixvsConfirmComentarioDialogModule
    ],
    exports: [
        FichaCrudComponent, FichaCrudHistorialComponent
    ],
})

export class FichaCrudModule {
}
