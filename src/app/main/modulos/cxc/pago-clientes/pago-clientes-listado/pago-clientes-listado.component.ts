import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { takeUntil } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from '../pago-clientes-listado/i18n/en';
import { locale as spanish } from '../pago-clientes-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PagoClientesService } from './pago-clientes.service';
import { PixvsMatAccordionCell } from '@pixvs/componentes/mat-accordion/mat-accordion.component';

@Component({
    selector: 'pago-clientes-listado',
    templateUrl: './pago-clientes-listado.component.html',
    styleUrls: ['./pago-clientes-listado.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PagoClientesListadoComponent {

    private URL = "/api/v1/cxcpago-clientes/";
    private rutaDestino = "/app/cxc/pago-clientes/nuevo/";

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String = 'Pago de clientes';
    subTitulo: String = 'Cuentas por cobrar';
    localeEN = english;
    localeES = spanish;

    //Tabla Saldos clientes
    tablaSaldosClientes = [];

    data: any[] = [];
    headers: PixvsMatAccordionCell[] = [
        { name: 'Código', value: 'codigo', flex: '0 0 10%' },
        { name: 'Nombre', value: 'nombre', flex: '0 0 50%' },
        { name: '# Facturas', value: 'noFacturas', flex: '0 0 15%', type: 'number' },
        { name: 'Saldo por cobrar', value: 'saldo', flex: '0 0 20%', type: 'money' },
        { name: 'Registrar pago', value: 'alumnoClienteId', flex: '0 0 5%', type: 'action', icon: 'input', action: this.registrarPago.bind(this) }
    ];
    details: PixvsMatAccordionCell[] = [
        { name: 'Sede', value: 'sede', flex: '0 0 20%' },
        { name: 'Folio', value: 'folio', flex: '0 0 20%' },
        { name: 'Fecha', value: 'fecha', flex: '0 0 20%', type: 'fecha' },
        { name: 'Monto', value: 'monto', flex: '0 0 15%', type: 'money' },
        { name: 'Saldo', value: 'saldo', flex: '0 0 15%', type: 'money' },
        { name: 'Método de pago', value: 'metodoPago', flex: '0 0 10%' }
    ]

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private router: Router,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _pagoService: PagoClientesService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this._pagoService.translate = this.translate;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.config = {
                icono: "payment"
            }
        });

        // Subscribe to update usuario on changes
        this._pagoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                let saldos: any[] = datos.saldos;

                if (saldos) {
                    let facturas: any[] = datos.facturas;

                    if (facturas) {
                        saldos.forEach(saldo => {
                            saldo.facturas = facturas.filter(factura => factura.alumnoClienteId == saldo.alumnoClienteId);
                        });
                    }

                    this.setDatosTablas(saldos || []);
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    setDatosTablas(tablaSaldosClientes) {
        this.tablaSaldosClientes = [...tablaSaldosClientes];

        let rows = [];
        this.tablaSaldosClientes.forEach(saldo => {
            let row = saldo;

            row.children = saldo.facturas;

            rows.push(row);
        });

        this.data = [].concat(rows);
    }

    recargarTabla(data) {
        this.setDatosTablas(data);
    }

    registrarPago(id, event) {
        event.stopPropagation();
        
        this.router.navigate([this.rutaDestino + this.hashid.encode(id)]);
    }
}