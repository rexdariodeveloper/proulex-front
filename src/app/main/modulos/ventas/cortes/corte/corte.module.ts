import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { CorteComponent } from './corte.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';

import { CorteService } from './corte.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { PdfModule } from '@pixvs/componentes/visor-pdf/visor-pdf.module';

const routes = [

    {
        path: 'cortes/:handle', redirectTo: 'cortes/:handle/', pathMatch: 'full'
    },
    {
        path: 'cortes/:handle/:id',
        component: CorteComponent,
        resolve: {
            data: CorteService,
        },
        data: { url: '/api/v1/cortes/listados/' }
    }
];

@NgModule({
    declarations: [
        CorteComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatListModule,
        FichaCrudModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        PdfModule

    ],
    providers: [
        CorteService
    ]
})

export class CorteModule {
}