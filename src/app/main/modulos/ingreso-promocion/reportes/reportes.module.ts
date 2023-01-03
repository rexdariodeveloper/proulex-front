import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { UtilsModule } from '@app/main/utils/utils.module';
import { FuseHighlightModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImprimirContratosModule } from './imprimir-contratos/imprimir-contratos.module';
import { PolizasSeguroVidaModule } from './polizas-seguro-vida/polizas-seguro-vida.module';

@NgModule({
    declarations: [],
    imports: [
        ImprimirContratosModule,
        PolizasSeguroVidaModule,

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,
        MatStepperModule,
        MatTableModule,

        FichaCrudModule,
        ImageCropperModule,

        PixvsMatSelectModule,
        PixvsDynamicComponentModule,
        PixvsTablasModule,

        TranslateModule,
        UtilsModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        ImpuestosArticuloSATService
    ],
    entryComponents: [
    ]
})

export class ReportesModule {
}