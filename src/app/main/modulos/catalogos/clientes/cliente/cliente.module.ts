import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ClienteComponent } from './cliente.component';
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

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsPhonePickerModule } from '@pixvs/componentes/phone-picker/phone-picker.module';

import { ClienteService } from './cliente.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { VerificarRfcComponent } from './dialogs/verificar-rfc/verificar-rfc.dialog';

const routes = [

    {
        path: 'clientes/:handle', redirectTo: 'clientes/:handle/', pathMatch: 'full'
    },
    {
        path: 'clientes/:handle/:id',
        component: ClienteComponent,
        resolve: {
            data: ClienteService,
        },
        data: { url: '/api/v1/clientes/listados/' },
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        ClienteComponent,
        VerificarRfcComponent
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

        FichaCrudModule,
        PixvsMatSelectModule,
        PixvsPhonePickerModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule

    ],
    providers: [
        ClienteService,
        PendingChangesGuard
    ]
})

export class ClienteModule {
}