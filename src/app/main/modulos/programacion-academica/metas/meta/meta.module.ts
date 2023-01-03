import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import {  MatDatepickerModule } from '@angular/material/datepicker';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { MatTableModule } from '@angular/material/table';
import { PixvsYearCalendarModule } from '@pixvs/componentes/year-calendar/year-calendar.module';
import { MetaComponent } from './meta.component';
import { MetaService } from './meta.service';
import { PixvsMenuSidebarModule } from '@pixvs/componentes/sidebars/menu-sidebar/menu-sidebar.module';
import { EditarMetaDialogComponent } from './dialogs/editar-meta/editar-meta.dialog';
import { MetaSumaDetallesPipe } from './pipes/suma-detalles.pipe';


const routes = [

    {
        path: 'metas/:handle', redirectTo: 'metas/:handle/', pathMatch: 'full'
    },
    {
        path: 'metas/:handle/:id',
        component: MetaComponent,
        resolve: {
            data: MetaService,
        },
        data: { url: '/api/v1/programas-metas/listados/' }
    }
];

@NgModule({
    declarations: [
        MetaComponent,

        EditarMetaDialogComponent,

        MetaSumaDetallesPipe
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
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
		MatTableModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
		PixvsMatChipAutocompleteModule,
        PixvsYearCalendarModule,
        PixvsMenuSidebarModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        MetaService
    ],
	entryComponents: [
        EditarMetaDialogComponent
    ]
})
export class MetaModule {
}