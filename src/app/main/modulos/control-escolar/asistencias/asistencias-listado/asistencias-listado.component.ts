import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import * as moment from 'moment';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ReporteAsistenciasService } from '../../reportes/reporte-asistencias/reporte-listado/reporte-listado.service';
import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';

@Component({
    selector: 'asistencias-listado',
    templateUrl: './asistencias-listado.component.html',
    styleUrls: ['./asistencias-listado.component.scss'],
    animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class AsistenciasListadoComponent {

    //Filtros
    @ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;
    
    filtros: FieldConfig[];
	filtrosOpciones: any  = [];

    @ViewChild('filter', { static: false })
    filter: ElementRef;

    private _unsubscribeAll: Subject <any> ;
    public dataSource: MatTableDataSource <any> = new MatTableDataSource([]);
    public data: any[] = [];
    public textoBuscador: string = '';

    constructor(
        public _fichasDataService: FichasDataService,
        public _asistenciasService: ReporteAsistenciasService,
        private router: Router,
        private hashid: HashidsService,
        private _matSnackBar: MatSnackBar,
        private translate: TranslateService,
        private _fuseSidebarService: FuseSidebarService,
        ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

    ngOnInit(): void {
        this.textoBuscador = this._asistenciasService.getTextoBuscador(this.router.url);
        this.dataSource.filterPredicate = (data: any, filter: string) => {
            let a = data?.codigo.trim().toLowerCase().includes(filter.trim().toLowerCase());
            let b = data?.sucursal.trim().toLowerCase().includes(filter.trim().toLowerCase());
            let c = (data?.plantel || '').trim().toLowerCase().includes(filter.trim().toLowerCase());
            let d = data?.nivel.trim().toLowerCase().includes(filter.trim().toLowerCase());
            let e = data?.horario.trim().toLowerCase().includes(filter.trim().toLowerCase());
            let f = data?.nombreProfesor.trim().toLowerCase().includes(filter.trim().toLowerCase());
            let g = data?.nombreSuplente.trim().toLowerCase().includes(filter.trim().toLowerCase());
            return a || b || c || d || e || f || g;
        }

        this._fichasDataService.onDatosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((datos) => {
            let d = (datos?.datos || []);
            
            this.data = d;
            this.dataSource.data = d;

            let permisos: Object = datos?.permisos || new Object();

            if (permisos.hasOwnProperty('MOSTRAR_FILTROS')) {
                this.filtros = [
                    {
                        type: "pixvsMatSelect",
                        label: "Sede",
                        name: "sede",
                        formControl: new FormControl(null, [Validators.required]),
                        validations: [],
                        multiple: true,
                        selectAll: false,
                        list: datos?.sedes,
                        campoValor: 'nombre',
                    },
                    {
                        type: "pixvsMatSelect",
                        label: "Año",
                        name: "anio",
                        formControl: new FormControl(null, [Validators.required]),
                        validations: [],
                        multiple: false,
                        selectAll: false,
                        list: datos?.anios
                    },
                    {
                        type: "pixvsMatSelect",
                        label: "Modalidad",
                        name: "modalidad",
                        formControl: new FormControl(null, [Validators.required]),
                        validations: [],
                        multiple: true,
                        selectAll: false,
                        list: datos?.modalidades,
                        campoValor: 'nombre',
                        values: ['codigo', 'nombre'],
                    },
                    {
                        type: "pixvsMatSelect",
                        label: "Fecha de inicio",
                        name: "fechas",
                        formControl: new FormControl(null, [Validators.required]),
                        validations: [],
                        multiple: true,
                        selectAll: false,
                        list: [],
                        campoValor: 'fecha'
                    }
                ];

                var anio = new Date().getFullYear();
                var modalidad = null;

                let regAnio = this.filtros.find(item => item.name == 'anio');

                regAnio.formControl.setValue(anio);

                regAnio.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                    this.updateFechas([]);

                    anio = regAnio.formControl.value;

                    if (anio && modalidad) {
                        var json = {
                            anio: anio,
                            modalidad: modalidad
                        };

                        this._asistenciasService.getFechasByFiltros(json);
                    }
                });

                let regModalidad = this.filtros.find(item => item.name == 'modalidad');

                regModalidad.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                    this.updateFechas([]);

                    modalidad = regModalidad.formControl.value;

                    if (anio && modalidad && modalidad.length) {
                        var json = {
                            anio: anio,
                            modalidad: modalidad
                        };

                        this._asistenciasService.getFechasByFiltros(json);
                    }
                });

                this._asistenciasService.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
                    if (!!data?.fechas) {
                        if (data?.fechas.length == 0) {
                            this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
                        } else {
                            this.updateFechas(data.fechas.map(item => { return { id: moment(item).format('DDMMYYYY'), fecha: moment(item).format('DD/MM/YYYY') }; }));
                        }
                    }
                });
            }
        });

        if(this.textoBuscador !== '')
            this.dataSource.filter = this.textoBuscador;
    }

    ngAfterViewInit(): void {
        if (!!this.filter) {
            fromEvent(this.filter.nativeElement, 'keyup')
                .pipe( takeUntil(this._unsubscribeAll), debounceTime(150), distinctUntilChanged() )
                .subscribe(() => {
                    if (!this.dataSource)
                        return;
                    this.dataSource.filter = this.filter.nativeElement.value;
                    this._asistenciasService.setTextoBuscador(this.router.url,this.filter.nativeElement.value || '');
                });
        }
    }

    updateFechas(fechas) {
        let field: FieldConfig = {
            type: "pixvsMatSelect",
            label: "Fecha de inicio",
            name: "fechas",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: true,
            selectAll: false,
            list: fechas,
            campoValor: 'fecha'
        };

        this.updateFilters(3, "fechas", field);
    }

    updateFilters(index: number, name: string, field: FieldConfig) {
        let regIndex = this.filtros.findIndex(item => item.name == name);

        if (regIndex != -1) {
            this.filtros.splice(regIndex, 1);
        }

        this.filtros.splice(index, 0, field);
        this.filtros = [...this.filtros];
    }

    rutaDestino(rutaId: number){
        this._fichasDataService.cargando = true;
        this.router.navigate(['/app/control-escolar/asistencias/ver/'+ this.hashid.encode(rutaId)]);
    }

    applyFilter(filterString: string) {
        this.dataSource.filter = filterString.trim().toLowerCase();
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
	}
}