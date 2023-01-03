import { Component, Input, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ClienteCardProjection } from "@app/main/modelos/cliente";
import { environment } from "@environments/environment";
import { fuseAnimations } from "@fuse/animations";
import { HashidsService } from "@services/hashids.service";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";

@Component({
    selector: 'punto-venta-in-company-clientes',
    templateUrl: './in-company-clientes.component.html',
    styleUrls: ['./in-company-clientes.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaInCompanyClientesComponent {

    // Propiedades de configuración de la ficha
	apiUrl: string = environment.apiUrl;

    // @Inputs
	@Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

    // Listados
    clientes: ClienteCardProjection[] = [];

    // FormControls
	filtroControl: FormControl = new FormControl('',[]);

    // Private
	private _unsubscribeAll: Subject < any > ;

    constructor(
        public _puntoVentaAbiertoService: PuntoVentaAbiertoService,
        private hashid: HashidsService
    ){
        // Set the private defaults
		this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        // Subscribe to update grupos on changes
		this._puntoVentaAbiertoService.onClientesInCompanyChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if(datos){
                    this._puntoVentaAbiertoService.onClientesInCompanyChanged.next(null);
                    this.clientes = datos.clientes;
                }
            });

        this._puntoVentaAbiertoService.getClientesInCompany();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
    }

    onVistaAtras(){
        this.componentePV.filtroControl.setValue('');
        this.clientes = [];
        this.componentePV.vistaNavegador = 'Idiomas';
    }

    onCliente(cliente: ClienteCardProjection){
        this.componentePV.clienteInCompanySeleccionado = cliente;
        this.componentePV.vistaNavegador = 'Grupos In Company';
    }

}