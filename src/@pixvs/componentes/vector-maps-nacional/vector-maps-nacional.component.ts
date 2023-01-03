import { Component, Inject, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'vector-maps-nacional',
    templateUrl: './vector-maps-nacional.component.html',
    styleUrls: ['./vector-maps-nacional.component.scss'],
    animations: fuseAnimations
})
export class VectorNacionalMapsComponent {
    @Input() pdfSrc;
    @Input() myData;
    @Output() output: EventEmitter<any> = new EventEmitter();

	//TODAS LAS CLAVES EN https://canela.me/articulo/JavaScript-Google-Charts/Google-GeoCharts-Distrito-Federal-o-Ciudad-de-M%C3%A9xico
    zoom = 1;
    options = {
        region: 'MX',
        displayMode: 'regions',
        resolution: 'provinces',
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
    }

}