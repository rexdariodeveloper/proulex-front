import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { TabuladorComponent } from './tabulador.component';
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

import { TabuladorService } from './tabulador.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AgregarSalarioComponent } from './dialogs/agregar-salario/agregar-salario.dialog';
import { AgregarCursoComponent } from './dialogs/agregar-curso/agregar-curso.dialog';

const routes = [

    {
        path: 'tabuladores/:handle', redirectTo: 'tabuladores/:handle/', pathMatch: 'full'
    },
    {
        path: 'tabuladores/:handle/:id',
        component: TabuladorComponent,
        resolve: {
            data: TabuladorService,
        },
        data: { url: '/api/v1/tabuladores/listados/' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        TabuladorComponent,
        AgregarSalarioComponent,
        AgregarCursoComponent
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

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule

    ],
    providers: [
        TabuladorService,
        PendingChangesGuard
    ]
})

export class TabuladorModule {
}