import { Component, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FiltrosKardexAlumnoSidebarComponent } from './sidebars/main/filtros-reporte-sidebar.component';
import { KardexAlumnoService } from './kardex-alumno.service';
import { JsonResponse } from '@models/json-response';

@Component({
    selector: 'kardex-alumno',
    templateUrl: './kardex-alumno.component.html',
    styleUrls: ['./kardex-alumno.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class KardexAlumnoComponent {
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }
    
    isLoading: boolean = false;

    @ViewChild(FiltrosKardexAlumnoSidebarComponent) filtrosComponent: FiltrosKardexAlumnoSidebarComponent;

    filtros: FieldConfig[] = [
        {
            type: "input",
            label: 'Código del alumno',
            inputType: "text",
            name: "codigoAlumno",
            validations: [
                {"name": "required","validator": Validators.required,"message": "Este campo es requerido"},
                {"name": "maxlength","validator": Validators.maxLength(9),"message": "Máximo 9 caracteres"},
                {"name": "maxlength","validator": Validators.maxLength(9),"message": "Máximo 9 caracteres"}
            ]
        },
        {
            type: "button",
            label: "Save",
            hidden: true
        }
    ];
    filtrosOpciones: any = [];
    private _unsubscribeAll: Subject<any>;
    url: string = null;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        public _fichasDataService: KardexAlumnoService,
        private _fuseSidebarService: FuseSidebarService) {
        
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    if(datos?.url) {
                        this.url = datos.url;
						this._fuseSidebarService.getSidebar('filtros-reporte-sidebar').close();
                    }
                }
            );
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    imprimir(){
        this.filtrosComponent.imprimir();
    }

    verSubreporte(event) {
		this._fichasDataService.cargando = true;

		this._fichasDataService.descargarSubreporte(event).then(
			function (result: JsonResponse) {
				this._fichasDataService.cargando = false;
			}.bind(this)
		);
	}
}