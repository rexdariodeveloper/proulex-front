import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { DescuentoComponent } from './descuento.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';

import { DescuentoService } from './descuento.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { VerificarRfcComponent } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { AgregarArticuloComponent } from './dialogs/agregar-articulo/agregar-articulo.dialog';
import { AgregarUsuarioComponent } from './dialogs/agregar-usuario/agregar-usuario.dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


const routes = [

    {
        path: 'descuentos/:handle', redirectTo: 'descuentos/:handle/', pathMatch: 'full'
    },
    {
        path: 'descuentos/:handle/:id',
        component: DescuentoComponent,
        resolve: {
            data: DescuentoService,
        },
        data: { url: '/api/v1/descuentos/listados/' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        DescuentoComponent,
        VerificarRfcComponent,
        AgregarArticuloComponent,
        AgregarUsuarioComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
        MatListModule,
        MatCheckboxModule,
        MatTableModule,
        PixvsMatChipAutocompleteModule,

        FichaCrudModule,
        PixvsMatSelectModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule

    ],
    providers: [
        DescuentoService,
        PendingChangesGuard
    ]
})

export class DescuentoModule {
}