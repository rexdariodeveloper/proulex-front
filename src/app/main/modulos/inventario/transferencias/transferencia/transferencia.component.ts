import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Transferencia, TransferenciaProjection } from '@app/main/modelos/transferencia';
import { TransferenciaDetalleProjection, TransferenciaMovimiento } from '@app/main/modelos/transferencia-detalle';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { PixvsTablaSimpleComponent } from '@pixvs/componentes/tablas/simple/tabla-simple.component';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { ArticuloDialogComponent, ArticuloDialogData } from './dialogs/articulo.dialog';
import { TransferenciaInvoiceData, TransferenciaInvoicePrintComponent } from './prints/invoice.print';
import { TransferenciaDetalleService } from './transferencia-detalle.service';
import { TransferenciaService } from './transferencia.service';

@Component({
    selector: 'transferencia',
    templateUrl: './transferencia.component.html',
    styleUrls: ['./transferencia.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TransferenciaComponent {

    private URL: string = '/api/v1/transferencias';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    @ViewChild('localidadOrigenSelect') localidadOrigenSelect: PixvsMatSelectComponent;
    @ViewChild('localidadDestinoSelect') localidadDestinoSelect: PixvsMatSelectComponent;
    @ViewChild(TransferenciaInvoicePrintComponent) invoice: TransferenciaInvoicePrintComponent;
    @ViewChild('tablaArticulos') tabla: PixvsTablaSimpleComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    // Controls
    form: FormGroup;
    currentId: number;
    maxDatePicker: any;

    // Private
    private transferencia: Transferencia;
    private historial: any;
    private _unsubscribeAll: Subject<any>;

    // Listados
    listadoArticulos: any[] = [];
    almacenes: any[];
    almacenesTodos: any[];
    listadoAlmacenesOrigen: any[] = [];
    listadoAlmacenesDestino: any[] = [];
    localidades: any[] = [];
    listadoLocalidadesOrigen: any[] = [];
    listadoLocalidadesDestino: any[] = [];
    listadoLocalidadesArticulos: any[] = [];
    listadoLocalidadesArticulosActivos: any[] = [];
    listadoArticulosMostrar: any[] = [];

    // Cbo Controls    
    articuloControl: FormControl = new FormControl();
    almacenOrigenControl: FormControl = new FormControl();
    almacenDestinoControl: FormControl = new FormControl();
    localidadOrigenControl: FormControl = new FormControl();
    localidadDestinoControl: FormControl = new FormControl();

    // Tabla Artículos
    columnasTabla: any[] = [
        {
            name: 'articulo.codigoArticulo',
            values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
            title: "Artículo",
            class: "mat-column-flex flex-40",
            centrado: false,
            type: null,
            tooltip: true
        },
        {
            name: 'articulo.unidadMedidaInventario.nombre',
            title: "UM",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'existencia',
            title: "Existencia",
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'cantidad',
            title: "Cantidad a transferir",
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'borrar',
            title: '',
            class: "mat-column-80",
            centrado: true,
            type: 'delete',
            tooltip: false
        }
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['articulo.codigoArticulo', 'articulo.unidadMedidaInventario.nombre', 'existencia' , 'cantidad', 'borrar'];
    camposListado: FieldConfig[] = [];

    currentDate: any = moment().format('YYYY-MM-DD');
    tablaArticulos = [];

    movimientos: TransferenciaMovimiento[] = [];
	dataSourceMovimientos: MatTableDataSource<TransferenciaMovimiento> = new MatTableDataSource([]);
	displayedColumnsMovimientos: string[] = [
		'fecha',
        'codigoArticulo',
        'nombreArticulo',
        'um',
        'cantidadEnviada',
        'cantidadTransferida',
        'cantidadDevuelta',
        'cantidadAjuste',
        'almacenOrigen',
        'almacenDestino',
        'usuario'
	];

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _transferenciaService: TransferenciaService,
        public _detallesService: TransferenciaDetalleService,
        public validatorService: ValidatorService,
        public fechaPipe: FechaPipe,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/inventario/transferencias",
                rutaBorrar: this.URL + "/transferencias/delete/",
                icono: "redo"
            }
        });

        // Subscribe to update on changes
        this._transferenciaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    this.transferencia = datos.transferencia || new Transferencia();
                    let transferenciaDetalles = datos.transferenciaDetalles || [];
                    this.listadoLocalidadesArticulos = datos.localidaesArticulos;
                    this.listadoLocalidadesArticulosActivos = datos.localidaedesArticulosActivos;
                    this.historial = datos.historial;

                    if (this.pageType == 'ver') {
                        this.listadoAlmacenesOrigen = [this.transferencia.localidadOrigen.almacen];
                        this.listadoAlmacenesDestino = [this.transferencia.localidadDestino.almacen];
                        this.listadoLocalidadesOrigen = !this.transferencia.localidadOrigen.localidadGeneral ? [this.transferencia.localidadOrigen] : [];
                        this.listadoLocalidadesDestino = !this.transferencia.localidadDestino.localidadGeneral ? [this.transferencia.localidadDestino] : [];

                        transferenciaDetalles.forEach(registro => {
                            //registro.existencia = this.getExistencia(this.transferencia.localidadOrigen.id, registro.articulo.id) + registro.cantidad;
                            registro.existencia = this.getExistencia(this.transferencia.localidadOrigen.id, registro.articulo.id);
                        });

                        this.displayedColumns = ['articulo.codigoArticulo', 'articulo.unidadMedidaInventario.nombre', 'cantidad'];

                        this.form = this.createForm();
                        this.form.disable({ emitEvent: false });

                        this.titulo = this.transferencia.codigo;
                    } else {
                        this.maxDatePicker = new Date().toISOString().split("T")[0];

                        this.almacenes = datos.almacenes;
                        this.almacenesTodos = datos.almacenes_todos;
                        this.listadoAlmacenesOrigen = this.almacenes;
                        this.listadoAlmacenesDestino = this.almacenesTodos;
                        this.localidades = datos.localidades;
                        this.listadoLocalidadesOrigen = [];
                        this.listadoLocalidadesDestino = [];
                        this.listadoArticulos = datos.articulos;

                        this.form = this.createForm();
                        this.form.enable({ emitEvent: false });

                        if(this.almacenes.length == 1)
                            this.almacenOrigenControl.setValue(this.almacenes[0]);

                        this.titulo = this.translate.instant('TITULO');
                    }

                    this.form.controls['fecha'].disable();
                    if(!this.transferencia?.id)
                        this.form.controls['fecha'].setValue(this.currentDate);

                    this.tablaArticulos = [...transferenciaDetalles];
                    this._detallesService.setDatos(this.tablaArticulos);

                    this.movimientos = datos.movimientos;
                    this.dataSourceMovimientos.data = datos.movimientos;
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        this.almacenOrigenControl = new FormControl(this.transferencia.localidadOrigen ? this.transferencia.localidadOrigen.almacen : null, [Validators.required]);
        this.almacenDestinoControl = new FormControl(this.transferencia.localidadDestino ? this.transferencia.localidadDestino.almacen : null, [Validators.required]);
        this.localidadOrigenControl = new FormControl(this.transferencia.localidadOrigen, [Validators.required]);
        this.localidadDestinoControl = new FormControl(this.transferencia.localidadDestino, [Validators.required]);
        this.articuloControl = new FormControl(null, [Validators.required]);

        this.almacenOrigenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let almacenId = this.almacenOrigenControl.value ? this.almacenOrigenControl.value.id : null;
            let localidadGeneral = this.localidades.filter(registro => { return registro.almacen.id == almacenId && registro.localidadGeneral })[0];

            //this.listadoLocalidadesOrigen = this.localidades.filter(registro => { return registro.almacen.id == almacenId && !registro.localidadGeneral });
            this.listadoLocalidadesOrigen = this.localidades.filter(registro => { return registro.almacen.id == almacenId });

            if (this.localidadOrigenSelect) {
                this.localidadOrigenSelect.setDatos(this.listadoLocalidadesOrigen);
            }

            this.localidadOrigenControl.setValue(localidadGeneral && this.listadoLocalidadesOrigen.length <= 1 ? localidadGeneral : null);
        });

        this.almacenDestinoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let almacenId = this.almacenDestinoControl.value ? this.almacenDestinoControl.value.id : null;
            let localidadGeneral = this.localidades.filter(registro => { return registro.almacen.id == almacenId && registro.localidadGeneral })[0];

            //this.listadoLocalidadesDestino = this.localidades.filter(registro => { return registro.almacen.id == almacenId && !registro.localidadGeneral });
            this.listadoLocalidadesDestino = this.localidades.filter(registro => { return registro.almacen.id == almacenId });

            if (this.localidadDestinoSelect) {
                this.localidadDestinoSelect.setDatos(this.listadoLocalidadesDestino);
            }

            this.localidadDestinoControl.setValue(localidadGeneral && this.listadoLocalidadesDestino.length <= 1 ? localidadGeneral : null);
        });

        this.localidadOrigenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this._detallesService.setDatos();
        });

        let form = this._formBuilder.group({
            id: [this.transferencia.id],
            codigo: [this.transferencia.codigo],
            fecha: [moment(this.transferencia.fecha).format('YYYY-MM-DD'), Validators.required], // Mantener formato sin horas para mostrar en detalle
            almacenOrigen: this.almacenOrigenControl,
            almacenDestino: this.almacenDestinoControl,
            localidadOrigen: this.localidadOrigenControl,
            localidadDestino: this.localidadDestinoControl,
            comentario: [this.transferencia.comentario],
            estatus: [this.transferencia.estatus ? this.transferencia.estatus.valor : null]
        }); 

        return form;
    }

    getExistencia(localidadId: number, articuloId: number) {
        let localidadArticulo = this.listadoLocalidadesArticulos.filter(registro => {
            return registro.localidadId == localidadId && registro.articuloId == articuloId
        })[0];

        return articuloId && localidadId ? (localidadArticulo ? localidadArticulo.cantidad : 0) : null;
    }

    isRequired(campo: string) {
        let form_field = this.form.get(campo);

        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);

        return !!(validator && validator.required);
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    guardar() {
        if(this._transferenciaService.cargando)
            return;

        this._transferenciaService.cargando = true;

        if (this.form.valid) {
            this.form.disable({ emitEvent: false });

            let transferenciaDetalles: TransferenciaDetalleProjection[] = [];
            this._detallesService.getDatos().forEach(registro => {
                let detalle = new TransferenciaDetalleProjection(registro);
                detalle.cantidad = Number(detalle.cantidad);
                if(!this.form.controls['id']?.value)
                    detalle.id = null;
                transferenciaDetalles.push(detalle);
            });

            if (transferenciaDetalles.length == 0) {
                this._transferenciaService.cargando = false;
                this.form.enable({ emitEvent: false });
                this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });

                return;
            }

            let transferencia = new TransferenciaProjection(this.form.value, transferenciaDetalles);

            if (transferencia.localidadOrigen.id == transferencia.localidadDestino.id) {
                this._transferenciaService.cargando = false;
                this.form.enable({ emitEvent: false });
                this._matSnackBar.open(this.translate.instant('LOCALIDADES_IGUALES'), 'OK', { duration: 5000 });

                return;
            }

            this._transferenciaService.guardar(transferencia, this.URL + '/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this.transferencia = transferencia;
                        this.transferencia.codigo = result.data;
                        this.onPrint();
                    } else {
                        this._transferenciaService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._transferenciaService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    agregarArticulo() {
        this.articuloControl.setValue(null);
        this.modalShow(null);
    }

    onEditar(articuloId: number) {
        if (this.pageType != 'ver') {
            let articuloEditar = this._detallesService.getDatos()[this.getRowIndex(articuloId)];
            this.articuloControl.setValue(articuloEditar);
            this.modalShow(articuloEditar);
        }
    }

    onAceptarDialog(articulo: any) {
        let tablaArticulos: any[] = this._detallesService.getDatos();

        if(articulo){
            let articuloEditar: any = {};
            Object.assign(articuloEditar, articulo);

            let articuloId = articuloEditar.articulo.id;
            let index = this.getRowIndex(articuloId);

            if (index != null) {
                tablaArticulos[index].cantidad = articuloEditar.cantidad;
            } else {
                articuloEditar.id = articuloId;
                tablaArticulos.push(articuloEditar);
            }
        }

        this.tablaArticulos = [...tablaArticulos];
        this._detallesService.setDatos(this.tablaArticulos)
    }

    modalShow(articulo: any): void {
        // Listado de articulos en localidad Origen
        let articulosOrigen = this.listadoLocalidadesArticulosActivos.filter(arto => arto.localidadId == this.localidadOrigenControl.value.id);
        let articulosDestino = this.listadoLocalidadesArticulosActivos.filter(artd => artd.localidadId == this.localidadDestinoControl.value.id);
        let matchOrigen = articulosOrigen.filter(artm => !!articulosDestino.find(ad => ad.articuloId == artm.articuloId));

        let listadoArticulosMostrar = this.listadoLocalidadesArticulos.filter((item) => {
            let itemActivo = matchOrigen.find( la => (la.articuloId == item.articuloId));
            // let itemActivo = this.listadoLocalidadesArticulosActivos.find( la => (la.articuloId == item.articuloId && la.localidadId == this.localidadOrigenControl.value.id && item.localidadId == this.localidadOrigenControl.value.id ));
            return !!itemActivo;
        });

        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            camposListado: this.createCamposListado(articulo, listadoArticulosMostrar),
            onAceptar: this.onAceptarDialog.bind(this),
            localidadId: this.localidadOrigenControl.value ? this.localidadOrigenControl.value.id : null,
            listadoLocalidadesArticulos: listadoArticulosMostrar,//this.listadoLocalidadesArticulos,
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '550px',
            data: dialogData
        });
    }

    getRowIndex(articuloId: number) {
        let index: number = null;
        this._detallesService.getDatos().forEach((registro, i) => { index = registro.id == articuloId ? i : index; });
        return index;
    }

    createCamposListado(detalle, listadoArticulosMostrar){

        let listadoArticulos = [];
        this.listadoArticulos.forEach( articulo => {
            let a = this._detallesService.datos.find( d => d?.articulo?.id == articulo?.id);
            let art_loc = listadoArticulosMostrar.find(lam => lam.articuloId == articulo.id)
            // let art_loc = this.listadoLocalidadesArticulos.find(al => al.articuloId == articulo.id && this.localidadOrigenControl.value.id == al.localidadId);
            if(!a && !!art_loc)
                listadoArticulos.push(articulo);
        });

        if(detalle)
            listadoArticulos.push(detalle.articulo);

        return [
            {
                type: 'pixvsMatSelect',
                label: this.translate.instant('ARTICULO'),
                name: 'articulo',
                formControl: this.articuloControl,
                multiple: false,
                selectAll: false,
                list: listadoArticulos,
                campoValor: 'nombreArticulo',
                values: ['codigoArticulo', 'nombreArticulo'],
                elementsPerScroll: 100,
                validations: [],
            },
            {
                type: 'input',
                label: this.translate.instant('EXISTENCIA'),
                inputType: 'text',
                mask: "separator.4",
                name: 'existencia',
                validations: [],
                readonly: true,
            },
            {
                type: 'input',
                label: this.translate.instant('CANTIDAD'),
                inputType: 'text',
                mask: "separator.4",
                name: 'cantidad',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: this.translate.instant('REQUERIDO')
                    }
                ],
            }
        ];
    }

    onPrint(){
        let data: TransferenciaInvoiceData = {
            reimpresion: (this.pageType != 'nuevo'),
            codigo: this.transferencia?.codigo,
            destinoSede: this.transferencia?.localidadDestino?.almacen?.sucursal,
            destinoAlmacen: this.transferencia?.localidadDestino?.almacen,
            cedisSede: this.transferencia?.localidadOrigen?.almacen?.sucursal,
            cedisAlmacen: this.transferencia?.localidadOrigen?.almacen,
            comentarios: this.transferencia?.comentario,
            fecha: moment(this.transferencia?.fecha).format('DD/MM/YYYY hh:mm A'),
            usuario: JSON.parse(localStorage.getItem('usuario')),
            modulo: 'Transferencias',
            data: this._detallesService.datos,
            columns: ['codigo','descripcion','cantidad']//,'costo','importe']
        };
        this.invoice.setData(data);
        setTimeout(function(){ 
            window.print();
            this.router.navigate([this.config.rutaAtras]);
        }.bind(this) , 1000);
    }
}