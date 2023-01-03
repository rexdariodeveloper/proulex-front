import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FuseSidebarModule } from '@fuse/components';

import { FichaListadoComponent } from './listado.component';
import { MatSortModule } from '@angular/material/sort';
import { FichasDataService } from '@services/fichas-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ListadoFiltradoSidebarComponent } from './sidebars/main/listado-filtrado-sidebar.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { PixvsBuscadorAmazonModule } from '@pixvs/componentes/buscador-amazon/buscador-amazon.module';

@NgModule({
    declarations: [
        FichaListadoComponent,
        ListadoFiltradoSidebarComponent
    ],
    imports: [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatToolbarModule,
        MatRippleModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatDatepickerModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatProgressBarModule,
        CdkTableModule,
        CdkTreeModule,
        DragDropModule,
        ScrollingModule,

        TranslateModule,

		PixvsDynamicComponentModule,
		PixvsBuscadorAmazonModule,
        
        FuseSidebarModule,
        FuseSharedModule,
        FuseHighlightModule
    ],
    providers: [
        FichasDataService
    ],
    exports: [
		FichaListadoComponent,
		
		MatMenuModule
    ]
})
export class FichaListadoModule {
}
