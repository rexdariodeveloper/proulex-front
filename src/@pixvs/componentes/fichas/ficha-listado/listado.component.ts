import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaListadoConfig, ListadoAcciones, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { RolMenu } from '@models/rol';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { TableDataSource } from '@pixvs/utils/table-data-source';
import { FichasDataService } from '@services/fichas-data.service';
import { HashidsService } from '@services/hashids.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PixvsBuscadorAmazonEvent, PixvsBuscadorAmazonOpcion } from '@pixvs/componentes/buscador-amazon/buscador-amazon.component';
import { FichaListadoService } from '@services/ficha-listado.service';

@Component({
    selector: 'ficha-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FichaListadoComponent {

    @Input() subTitulo: string;
    @Input() config: FichaListadoConfig;
    @Input() filtros: FieldConfig[];
    @Input() filtrosOpciones: [];
    @Input() nuevo: boolean = true;
    @Input() buscadorAmazonOptions: PixvsBuscadorAmazonOpcion[] = [];
    @Input() textoBuscador: string = '';
    @Input() selection = new SelectionModel<any>(true, []);

    @Output() outputMenu: EventEmitter<any> = new EventEmitter();
    @Output() outputEnviar: EventEmitter<boolean> = new EventEmitter();
    @Output() outputFiltro: EventEmitter<any> = new EventEmitter();

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild('filter', { static: false })
    filter: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    apiUrl: string = environment.apiUrl;

    dataSource: TableDataSource | null;
    page: number = 0;

    public cargando = false;

    private idFicha: number;

    rolMenu: RolMenu;

    dataLenght: number;

    datos: any[];

    filtrosMap: any = {};

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public _FichasDataService: FichasDataService,
        private _snackBar: MatSnackBar,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseNavigationService: FuseNavigationService,
        private hashid: HashidsService,
        private router: Router,
        public dialog: MatDialog,
        private translate: TranslateService,
        private _fichaListadoService: FichaListadoService,
        private route: ActivatedRoute
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }
    
    ngOnInit() {
        this.textoBuscador = this._fichaListadoService.getTextoBuscador(this.router.url);
        // Obtenemos los filtros desde en localstorage
        this.filtrosMap = this._fichaListadoService.getFiltros(this.router.url);
        this.rolMenu = this._fuseNavigationService.getSelectedPermisos();

        this._fuseTranslationLoaderService.loadTranslations(this.config.localeEN, this.config.localeES);

        this._FichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(enviar => {
            if(!!this.selection){
                this.selection.clear();
            }
        });

        //this.dataSource = new MatTableDataSource(ELEMENT_DATA);        
        this.dataSource = new TableDataSource(this._FichasDataService, this.paginator, this.sort, this.config.columasFechas, this.config.ocultarPaginador);


        // Subscribe to update profesor on changes
        this._FichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.datos = datos.datos ? datos.datos : datos;
                if (datos && datos.length == 1 && this.config.cargarUnicoRegistro) {

                    this.rutaDestino('ver/' + this.hashid.encode(datos[0][this.config.columnaId]), null);
                }
            });
        if(this.textoBuscador !=''){
            this.dataSource.filter = this.textoBuscador;
        }
    }

    ngAfterViewInit() {
        if (!!this.filter) {
            fromEvent(this.filter.nativeElement, 'keyup')
                .pipe(
                    takeUntil(this._unsubscribeAll),
                    debounceTime(150),
                    distinctUntilChanged()
                )
                .subscribe(() => {
                    if (!this.dataSource) {
                        return;
                    }

                    this.paginator.pageIndex = 0;
                    this.dataSource.filter = this.filter.nativeElement.value;

                    this._fichaListadoService.setTextoBuscador(this.router.url,this.filter.nativeElement.value || '');
                });
        }

        setTimeout(() =>{
            // Carga los filtros que tiene en localstorage de filtros
            this.onCargaFiltros();
        }, 0)
        
    }

    onCargaFiltros(){
        if(!!this.filtros && !!this.filtrosMap){
            if(this.filtrosMap.url == this.router.url){
                if(this.filtrosMap.filtros != ''){
                    this.filtros.map(filtro => {
                        if(filtro.name != 'fechas')
                            filtro.formControl.setValue(this.filtrosMap.filtros[filtro.name]); 
                            //filtro.formControl.setValue(this.filtrosMap.filtros[filtro.name].map(item => { return { fecha: moment(item.fecha).format('DD/MM/YYYY') }; })); 
                        //else
                          //  filtro.formControl.setValue(this.filtrosMap.filtros[filtro.name]); 
                        //filtro.formControl.setValue(this.filtrosMap.filtros[filtro.name]); 
                    });
                    this._FichasDataService.getDatosFiltros(this.filtrosMap.filtros);
                }
            }else{ 
                // Cuando es diferente el URL se limpio el localstorage de filtros
                this._fichaListadoService.setFiltros(this.router.url, '');
            }
        }else{
            // Cuando no hay filtros en la ficha de el URL se limpio el localstorage de filtros
            this._fichaListadoService.setFiltros(this.router.url, '');
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    unloadHandler(event: Event) {
        // Cuando actualizar la pagina (ctrl + smite + r ó F5) se limpio el localstorage de filtros
        this._fichaListadoService.setFiltros(this.router.url, '');
    }

    recargar() {
        this._FichasDataService.getDatos();
    }

    getElemento(element, names) {
        if (typeof names == 'string') {
            names = [names];
        }

        if (names.length == 1) {
            let campos: any[] = names[0].split('.');

            let valor: any = null;
            campos.forEach(campo => {
                if (valor) {
                    valor = valor[campo];
                } else {
                    valor = element[campo];
                }
            });
            switch (valor) {
                case null:
                case undefined:
                    return '';
                default:
                    return valor;
            }
        }

        let valor = '';
        names.forEach((name, i) => {
            let campos: any[] = name.split('.');
            let campo = null;

            campos.forEach(function (item, j) {
                if (campo) {
                    campo = campo[item];
                } else {
                    campo = element[item];
                }

                if (campos.length == j + 1) {
                    valor = valor + campo + (names.length != i + 1 ? ' - ' : '');
                }
            });
        });

        return valor;
    }

    selectedOpcion(menu: ListadoMenuOpciones) {
        if (FichaListadoConfig.EXCEL == menu.tipo) {
            this._FichasDataService.getExcel(menu.url)

            this._snackBar.openFromComponent(IconSnackBarComponent, {
                data: {
                    message: 'Descargando...',
                    icon: 'cloud_download',
                },
                duration: 1 * 1000, horizontalPosition: 'right'
            });
        } else if (FichaListadoConfig.PERSONALIZADO == menu.tipo) {
            this.outputMenu.emit(menu);
        }
    }

    action(event: any, item: ListadoAcciones, id: any, objeto: any, stopPropagation: boolean = true) {
        if (stopPropagation) {
            event.stopPropagation();
        }

        if (item.accion) {
            item.accion(objeto, event, id);
        } else {
            if (item.tipo == 'delete') {
                const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
                    }
                });

                dialogRef.afterClosed().subscribe(confirm => {
                    if (confirm) {
                        this._FichasDataService.eliminar(item.url + this.hashid.encode(id));
                        this._FichasDataService.getDatos();
                    }
                });
            }

            if (item.tipo == 'download') {
                this._FichasDataService.getPDF(item.url + id);
            }

            if (item.tipo == 'download_zip') {
                this._FichasDataService.downloadFile(item.url + id, 'zip');
            }

            if (item.tipo == FichaListadoConfig.EXCEL) {
                this._FichasDataService.getExcel(item.url + id)
            }
        }
    }

    getHashId(id: number) {
        return this.hashid.encode(id)
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    rutaDestino(rutaId: string, tipo: string) {
        if (this.config?.rutaDestino && !this.config?.omitirRedireccionVer && !this._FichasDataService.cargando) {
            this._FichasDataService.cargando = true;
            this.router.navigate([this.config?.rutaDestino + (this.config?.nodoId ? this.config.nodoId + "/" : '') + rutaId]);
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        // console.log(event.container.data);
        this._FichasDataService.cargando = true;
        this._FichasDataService.cambiarOrden(event.previousIndex, event.currentIndex, (this._FichasDataService.url + '/modificar-orden/'));
        setTimeout(() => {
            this.recargar();
        }, 1000);

        /*if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }*/
    }

    objetosSeleccionadosMap: { [key: number]: any } = {};
    seleccionar(element, columnaId) {
        event.stopPropagation();

        if (this.objetosSeleccionadosMap[element[columnaId]]) {
            this.objetosSeleccionadosMap[element[columnaId]] = null;
        } else {
            this.objetosSeleccionadosMap[element[columnaId]] = element;
        }
    }

    getColumnName(name: string | string[]) {
        if (typeof name == 'string') {
            return name;
        }
        return name.join(' - ')
    }

    onBuscarAmazon(event: PixvsBuscadorAmazonEvent) {
        this._FichasDataService.getDatosFiltros({
            eventBuscadorAmazon: event
        });
    }

    enviar() {
        this.outputEnviar.emit(true);
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.filteredData.length;
        return numSelected === numRows;
    }

    masterToggle() {
        if (this.isAllSelected()) {
          this.selection.clear();
          return;
        }
        this.selection.select(...this.dataSource.filteredData);
    }

    checkboxLabel(row?: any): string {
        if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    descargarArchivo(element, columnaId, url: string, extension?: string): Promise<any> {
        event.stopPropagation();

        return this._FichasDataService.downloadFile(url.replace('[id]', this.hashid.encode(element[columnaId])), extension);
	}

    establecerOutputFiltro(datos){
        this.outputFiltro.emit(datos);
    }
}