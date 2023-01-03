import { NgModule } from '@angular/core';

import { ImageViewerComponent } from './image-viewer.component';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ImageViewerModule } from "lacuna-image-viewer";


@NgModule({
    declarations: [
        ImageViewerComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        ImageViewerModule
    ],
    providers: [
    ],
    exports: [
        ImageViewerComponent
    ]
})
export class ImageModule {
}
