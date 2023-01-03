import { NgModule } from '@angular/core';

import { VisorPdfComponent } from './visor-pdf.component';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PdfViewerModule } from 'ng2-pdf-viewer';


@NgModule({
    declarations: [
        VisorPdfComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        PdfViewerModule,
        MatIconModule,
        MatButtonModule
    ],
    providers: [
    ],
    exports: [
        VisorPdfComponent
    ]
})
export class PdfModule {
}
