import { Component, Inject, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'visor-pdf',
    templateUrl: './visor-pdf.component.html',
    styleUrls: ['./visor-pdf.component.scss'],
    animations: fuseAnimations
})
export class VisorPdfComponent {
    @Input() pdfSrc;
    @Output() onLinkClicked = new EventEmitter<String>();
	//pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
    zoom = 1;

	constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        //this.titleService.setTitle("CUCEA - Políticas Públicas");

    }

    ngOnInit(): void {

    }

    aumentarZoom(){
        this.zoom = this.zoom + 0.2;
    }

    disminuirZoom(){
        this.zoom = this.zoom == 0.2? 0.2 : this.zoom - 0.2;
    }

    contentLoaded(){
        setTimeout(()=>{
            let sections = document.getElementsByClassName("linkAnnotation");
            Array.from(sections).forEach((section: HTMLElement) => {
                section.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
                    let ref = String(a.href);
                    a.onclick = () => setTimeout(() => this.linkClicked(ref));
                    a.target = '';
                    a.href = 'javascript: void(0);';
                    a.title = '';
                });
            });
        },1000)
    }

    linkClicked(id){
        this.onLinkClicked.emit(id);
    }
}