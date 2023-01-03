import { NgModule } from '@angular/core';
import { PixvsTablaSimpleComponent } from './simple/tabla-simple.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PixvsTablaDetallesComponent } from './detalles/tabla-detalles.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [
		PixvsTablaSimpleComponent,
		PixvsTablaDetallesComponent
    ],
    imports: [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatRippleModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        CdkTableModule,
        CdkTreeModule,
        DragDropModule,
        ScrollingModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
		PixvsTablaSimpleComponent,
		PixvsTablaDetallesComponent
    ]
})
export class PixvsTablasModule {
}
