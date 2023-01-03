import { Component, Inject, ViewChild, ElementRef, Input } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'visor-imagen',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
    animations: fuseAnimations
})
export class ImageViewerComponent {
    @Input() imageSrc;
	//pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
    images=[];

	constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        //this.titleService.setTitle("CUCEA - Políticas Públicas");

    }

    ngOnInit(): void {
        this.images.push(this.imageSrc);
    }
}