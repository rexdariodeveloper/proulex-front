import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { HashidsService } from '@services/hashids.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CorteService } from './corte.service';

@Component({
    selector: 'corte',
    templateUrl: './corte.component.html',
    styleUrls: ['./corte.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CorteComponent {

    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    currentId: number;
    form: FormGroup = new FormGroup({});
    url: string = null;
    acciones: ListadoMenuOpciones[];

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _formBuilder: FormBuilder,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _corteService: CorteService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.titulo = 'Corte';
            }

            this.acciones = [{title:'PDF' , tipo: null},
                             {title:'XLSX', tipo: null}];

            this.config = {
                rutaAtras: "/app/ventas/cortes",
                icono: "strikethrough_s"
            }
        });

        // Subscribe to update cliente on changes
        this._corteService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if(!!datos?.url)
                    this.url = datos?.url;
            });

        this._corteService.getArchivoURL("/api/v1/cortes/pdf",{id: this.currentId});
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    actionClicked(event){
        if(event.option.title == 'PDF'){
            this._corteService.getPDFConFiltros("/api/v1/cortes/pdf", {id: this.currentId});
        } else if(event.option.title == 'XLSX'){
            this._corteService.getExcelConFiltros("/api/v1/cortes/resumen/xls", {id: this.currentId});
        }
    }
}