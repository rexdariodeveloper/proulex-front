import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { PrecioIncompanyComponent } from './precio-incompany.component';
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

import { PrecioIncompanyService } from './precio-incompany.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AgregarSalarioComponent } from './dialogs/agregar-salario/agregar-salario.dialog';

const routes = [

    {
        path: 'precio-incompany/:handle', redirectTo: 'precio-incompany/:handle/', pathMatch: 'full'
    },
    {
        path: 'precio-incompany/:handle/:id',
        component: PrecioIncompanyComponent,
        resolve: {
            data: PrecioIncompanyService,
        },
        data: { url: '/api/v1/precios-incompany/listados/' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        PrecioIncompanyComponent,
        AgregarSalarioComponent
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

        FichaCrudModule,
        PixvsMatSelectModule,
        PixvsMatChipAutocompleteModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule

    ],
    providers: [
        PrecioIncompanyService,
        PendingChangesGuard
    ]
})

export class PrecioIncompanyModule {
}