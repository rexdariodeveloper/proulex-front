import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { DataSource } from '@angular/cdk/collections';
import { ListaPrecioService } from './lista-precio.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Usuario } from '@models/usuario';
import { ArticuloComboProjection, ArticuloListadoPrecioMaterialProjection } from '@app/main/modelos/articulo';
import { ListadoPrecio, ListadoPrecioEditarProjection } from '@app/main/modelos/listado-precio';
import { ListadoPrecioDetalleEditarProjection } from '@app/main/modelos/listado-precio-detalle';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { UsuarioDatosAdicionalesComponent } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.component';
import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { CdkDetailRowDirective } from './cdk-detail-row.directive';
import { ListadoPrecioDetalleCurso } from '@app/main/modelos/listado-precio-detalle-curso';
import { MonedaComboProjection } from '@app/main/modelos/moneda';


@Component({
    selector: 'lista-precio',
    templateUrl: './lista-precio.component.html',
    styleUrls: ['./lista-precio.component.scss'],
    animations: [
        trigger('detailExpand', [
          state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
          state('*', style({ height: '*', visibility: 'visible' })),
          transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    encapsulation: ViewEncapsulation.None
})
export class ListaPrecioComponent implements ComponentCanDeactivate {
    @ViewChild(UsuarioDatosAdicionalesComponent) datosAdicionales: UsuarioDatosAdicionalesComponent;

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    listadoPrecio: ListadoPrecioEditarProjection;
    form: FormGroup;
    detalles: FormArray;



    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */

	
    articulos: any[];


	articuloControl: FormControl = new FormControl();
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };

    fechaActual = moment(new Date()).format('YYYY-MM-DD');

    articulosVenta = [];

    displayedColumns = ['imagen', 'codigo', 'nombre','unidadMedida','precioUnitario','impuesto','precio', 'boton'];
    displayedHijosColumns = ['codigoArticulo', 'nombreArticulo', 'unidadMedidaInventario.nombre','precioUnitario','iva','ieps','precio'];
    dataSource = new MatTableDataSource<any[]>();
    bogusDataSource = new MatTableDataSource<Element>(null);

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');

    deshabilitarBotones: boolean = true;

    precioBandera: boolean;
    precioUnitarioBandera: boolean;

    openedRow: CdkDetailRowDirective;

    selectedRow: number;

    materialesCurso: {[cursoArticuloId:string]: ArticuloListadoPrecioMaterialProjection[]} = {};
    preciosMaterialesControlsMap: {[articuloPadreId:string]: {[articuloMaterialId:string]: FormControl}} = {};

    monedas: MonedaComboProjection[];
    monedaControl: FormControl = new FormControl(null,[Validators.required]);

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
        public _listadoPrecioService: ListaPrecioService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.listadoPrecio = new ListadoPrecioEditarProjection();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.listadoPrecio = new ListadoPrecioEditarProjection();
            }

            this.config = {
                rutaAtras: "/app/ventas/lista-precios",
                rutaBorrar: "/api/v1/listado-precio/delete/",
                icono: "local_shipping"
            }

        });

        // Subscribe to update proveedor on changes
        this._listadoPrecioService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.listado) {
                    this.listadoPrecio = datos.listado;
                    this.titulo = this.listadoPrecio.nombre;
                    this.monedaControl.setValue(this.listadoPrecio.moneda);
                } else {
                    this.listadoPrecio = new ListadoPrecioEditarProjection();
                }
                this.monedas = datos.monedas;
                this.precioBandera = datos.precioBandera;
                this.precioUnitarioBandera = datos.precioUnitarioBandera;
				this.articulos = datos.articulos;
                this.articulos.forEach(articulo =>{
                    articulo['precio']=0;
                    articulo['importeIva']=0;
                    articulo['importeIeps']=0;
                    articulo['precioUnitario']=0;
                    articulo['hijos']=[];
                    articulo['idListadoDetalle']=null;
                    articulo['controlArticulos'] = new FormControl(null);
                    articulo['precioFinal']=0;
                    articulo['impuestoFinal']=0;
                    articulo['precioUnitarioFinal']=0;
                });
                this.dataSource.data = this.articulos;
                this.form = this.createEmpleadoForm();

                if (this.pageType == 'ver') {
                    this.form.disable();
                    this.deshabilitarBotones = false;
                    
                } else {
                    this.form.enable();
                    //this.usuarioGroup.enable();
                }
                

            });

        // Subscribe to update materiales on changes
        this._listadoPrecioService.onMaterialesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (!!datos) {
                    this._listadoPrecioService.onMaterialesChanged.next(null);
                    this.materialesCurso[datos.articuloId] = datos.libros.concat(datos.certificaciones);
                    this.preciosMaterialesControlsMap[String(datos.articuloId)] = {};
                    for(let articuloMaterial of this.materialesCurso[datos.articuloId]){
                        this.preciosMaterialesControlsMap[String(datos.articuloId)][String(articuloMaterial.id)] = new FormControl(articuloMaterial.precio,[]);
                        articuloMaterial.precioEditar = articuloMaterial.precio || 0;
                        articuloMaterial.precioUnitario = Number(articuloMaterial.precioEditar || 0)/(1 + articuloMaterial.iva + articuloMaterial.ieps);
                        let importeIva = articuloMaterial.precio*articuloMaterial.iva;
                        let importeIeps = articuloMaterial.precio*articuloMaterial.ieps;
                        articuloMaterial.precioFinal = Number(articuloMaterial.precioEditar || 0) + importeIva + importeIeps;
                    }
                }
            });

        
    }

    ngAfterViewInit() {
        //this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }

    createEmpleadoForm(): FormGroup {
		this.detalles = new FormArray([]);
        if(this.listadoPrecio.detalles){
            this.listadoPrecio.detalles.forEach(detalle =>{
                let index = this.articulos.findIndex(articulo =>{
                    return articulo.id == detalle.articulo.id;
                });
                if(index >= 0){
                    if(this.precioBandera){
                        this.articulos[index].precio = detalle.precio;
                        this.articulos[index].precioUnitario=detalle.precio/(1+this.articulos[index].iva+this.articulos[index].ieps);
                        this.articulos[index].importeIva=(detalle.precio/(1+this.articulos[index].iva+this.articulos[index].ieps))*this.articulos[index].iva;
                        this.articulos[index].importeIeps=(detalle.precio/(1+this.articulos[index].iva+this.articulos[index].ieps))*this.articulos[index].ieps;
                        this.articulos[index]['idReferencia'] =detalle.id;
                    }else{
                        this.articulos[index].precioUnitario=detalle.precio;
                        this.articulos[index].importeIva=(detalle.precio)*this.articulos[index].iva;
                        this.articulos[index].importeIeps=(detalle.precio)*this.articulos[index].ieps;
                        this.articulos[index].precio = this.articulos[index].precioUnitario + this.articulos[index].importeIva + this.articulos[index].importeIeps;
                        this.articulos[index]['idReferencia'] =detalle.id;
                    }
                }
            });
        }

        let form = this._formBuilder.group({
            id: [this.listadoPrecio.id],
            codigo: new FormControl(this.listadoPrecio.codigo, [Validators.required, Validators.maxLength(100),]),
            nombre: new FormControl(this.listadoPrecio.nombre, [Validators.required]),
            fechaInicio: new FormControl(this.listadoPrecio.fechaInicio ? moment(this.listadoPrecio.fechaInicio).format('YYYY-MM-DD') : null),
            fechaFin: new FormControl(this.listadoPrecio.fechaFin ? moment(this.listadoPrecio.fechaFin).format('YYYY-MM-DD') : null),
            indeterminado: new FormControl(this.listadoPrecio.indeterminado != null ?this.listadoPrecio.indeterminado : false, [Validators.required]),
            moneda: this.monedaControl,
            activo: new FormControl(this.listadoPrecio.activo !=null ? this.listadoPrecio.activo:true,[]),
            //detalles: this.detalles
            //contactoGroup: this.contactoGroup

        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            //form.get('codigoEmpleado').disabled;
        }
        return form;
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string, form: FormGroup) {

        let form_field = form.get(campo);
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
        if(!this.monedaControl.value){
            this._matSnackBar.open('Selecciona una moneda', 'OK', {
                duration: 5000,
            });
            return;
        }

        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        this.form.addControl('detalles',this.asignarArticulos());
        if (this.form.valid) {
            let listado: ListadoPrecio = this.form.getRawValue();
            for(let detalle of listado.detalles){
                detalle.detallesCurso = (this.materialesCurso[String(detalle.articulo.id)] || []).filter(detalleCurso => {
                    return !!detalleCurso.precio;
                }).map((detalleCurso): ListadoPrecioDetalleCurso => {
                    return {
                        articuloId: detalleCurso.id,
                        precio: detalleCurso.precio
                    };
                });
            }
            listado.moneda = this.monedaControl.value;
            this._listadoPrecioService.guardar(JSON.stringify(listado), '/api/v1/listado-precio/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
    					});
    					this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._empleadoService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {

            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._listadoPrecioService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    revisarDatosPrecio(){
        let banderaGuardar = true;
        if(banderaGuardar){
            this.guardar();
        }else{
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                width: '400px',
                data: {
                    mensaje: 'Hay datos sin guardat. ¿Deseas actualizarlos?'
                }
            });

            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.guardar();
                }
            });
        }
    }

    redondeo2Decimales(num: number){
        return Number((Math.round(num * 100) / 100).toFixed(2));
    }

    actualizarDatos(element){
        element.precioUnitario=Number(element.precio)/(1+element.iva+element.ieps);
        element.importeIva=(element.precio/(1+element.iva+element.ieps))*element.iva;
        element.importeIeps=(element.precio/(1+element.iva+element.ieps))*element.ieps;

        if(!!this.materialesCurso[element.id]){
            for(let articuloMaterial of this.materialesCurso[element.id]){
                articuloMaterial.precio = Number(articuloMaterial.precioEditar || 0);
                articuloMaterial.precioUnitario = Number(articuloMaterial.precioEditar || 0)/(1 + articuloMaterial.iva + articuloMaterial.ieps);
            }
        }
        
        this._matSnackBar.open(this.translate.instant('Precio de venta actualizado'), 'OK', {
            duration: 5000,
        });
    }
    
    actualizarDatosVenta(element,mensaje = false){
        element.importeIva=element.precioUnitario*element.iva;
        element.importeIeps=element.precioUnitario*element.ieps;
        element.precio=Number(element.precioUnitario) + element.importeIeps + element.importeIva;
        
        if(!!this.materialesCurso[element.id]){
            for(let articuloMaterial of this.materialesCurso[element.id]){
                articuloMaterial.precio = Number(articuloMaterial.precioEditar || 0);
    
                let importeIva = articuloMaterial.precio*articuloMaterial.iva;
                let importeIeps = articuloMaterial.precio*articuloMaterial.ieps;
                articuloMaterial.precioFinal = Number(articuloMaterial.precioEditar || 0) + importeIva + importeIeps;
            }
        }

        if(mensaje){
            this._matSnackBar.open(this.translate.instant('Precio unitario actualizado'), 'OK', {
                duration: 5000,
            });
        }
    }/////

    actualizarHijo(element){
        element.importeIva=element.precioUnitario*element.iva;
        element.importeIeps=element.precioUnitario*element.ieps;
        element.precio=Number(element.precioUnitario) + element.importeIeps + element.importeIva;
    }

    calcularIVA(element){
        let total = 0;
        return total;
    }

    calcularIEPS(element){
        let total = 0;
        return total;
    }

    calcularPrecioUnitario(element){
        let total = 0;
        return total;
    }

    calcularPrecioVenta(element){
        let total = 0;
        return total;
    }

    asignarArticulos(){
        let articulosForm = new FormArray([]);
        this.articulos.forEach(articulo =>{
            if(articulo.precio > 0){
                let hijosForm = new FormArray([]);
                articulo.controlArticulos=null;
                let form = this._formBuilder.group({
                    id:[articulo.idReferencia ? articulo.idReferencia:null],
                    listadoPrecioId: new FormControl(null),
                    padreId: new FormControl(null),
                    precio: new FormControl(this.precioBandera ? articulo.precio : articulo.precioUnitario),
                    articulo: new FormControl(articulo),
                    hijos:hijosForm
                })
                articulosForm.push(form);
            }
        })
        return articulosForm;
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    onToggleChange(cdkDetailRow: CdkDetailRowDirective, index: number = null, element: any = null) : void {
        if (this.openedRow && this.openedRow.expended) {
            this.openedRow.toggle();      
        }
        this.openedRow = cdkDetailRow.expended ? cdkDetailRow : undefined;
        this.selectedRow = cdkDetailRow.expended ? index : null;
        if(cdkDetailRow.expended && !!element){
            this.onBuscarMaterialesCurso(element);
        }
    }

    closeRow(element) {
        if(this.pageType == 'nuevo' || element.precioUnitario ==0){
            element.precio = 0;
        }else{
            element.precio=Number(element.precioUnitario) + element.importeIeps + element.importeIva;
        }
        this.onToggleChange(this.openedRow);
    }

    closeRowVenta(element) {
        if( (this.pageType == 'nuevo' && element.precio ==0) || (this.pageType == 'ver' && element.precio ==0)){
            element.precioUnitario = 0;
        }else{
            element.precioUnitario=Number(element.precio)/(1+element.iva+element.ieps);
        }
        this.onToggleChange(this.openedRow);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
     }

     descargarPlantilla(){
        this._listadoPrecioService.getPlantilla();
    }

    xlsxChangeEvent(event: any){
        let archivo: File = null;
        if(event?.target?.files?.length){
            for(let file of event.target.files){
                archivo = file;
            }
        }
        if(!!archivo){
            this._listadoPrecioService.subirArchivo(archivo).then((data)=>{
                data.data.forEach(articulo =>{
                let index = this.articulos.findIndex(articuloListado =>{
                    return articuloListado.codigoArticulo == articulo.codigoArticulo;
                });
                this.articulos[index].precio = articulo.precio;
                this.articulos[index].precioUnitario=articulo.precio/(1+this.articulos[index].iva+this.articulos[index].ieps);
                this.articulos[index].importeIva=(articulo.precio/(1+this.articulos[index].iva+this.articulos[index].ieps))*this.articulos[index].iva;
                this.articulos[index].importeIeps=(articulo.precio/(1+this.articulos[index].iva+this.articulos[index].ieps))*this.articulos[index].ieps;
                });
            });
        }
    }

    actualizarDatosArticuloSelected(articuloSelected){
        articuloSelected.precioUnitario=articuloSelected.precio/(1+articuloSelected.iva+articuloSelected.ieps);
        articuloSelected.importeIva=(articuloSelected.precio/(1+articuloSelected.iva+articuloSelected.ieps))*articuloSelected.iva;
        articuloSelected.importeIeps=(articuloSelected.precio/(1+articuloSelected.iva+articuloSelected.ieps))*articuloSelected.ieps;
    }

    exportarExcel(){
        this._listadoPrecioService.exportar(this.listadoPrecio.id);
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    onBuscarMaterialesCurso(articulo: any){
        if(articulo.esCurso && !this.materialesCurso[articulo.id]){
            this._listadoPrecioService.cargando = true;
            this._listadoPrecioService.getMateriales(articulo.id,this.listadoPrecio?.id || null);
        }
    }

}
