import { Component, Inject, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'vector-maps',
    templateUrl: './vector-maps.component.html',
    styleUrls: ['./vector-maps.component.scss'],
    animations: fuseAnimations
})
export class VectorMapsComponent {
    @Input() pdfSrc;
    @Input() myData;
    @Output() output: EventEmitter<any> = new EventEmitter();

	//pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
    zoom = 1;
    options = {
        legend: 'none',
        colors:['#68a4ad','#438b96','#1f6f7b','#005d6c']
      };

	constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        //this.titleService.setTitle("CUCEA - Políticas Públicas");

    }

    ngOnInit(): void {

    }

    onSelect(event){
      this.output.emit(this.myData[event.selection[0].row][1]['f']);
      //console.log(this.myData[event.selection[0].row][1]);
    }

}