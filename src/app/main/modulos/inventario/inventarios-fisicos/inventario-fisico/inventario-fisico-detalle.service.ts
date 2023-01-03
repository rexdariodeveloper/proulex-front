import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class InventarioFisicoDetalleService {

	datos: any;
	onDatosChanged: BehaviorSubject<any>;

	constructor() {
		// Set the defaults
		this.onDatosChanged = new BehaviorSubject({});
	}

	getDatos() {
		return this.datos;
	}

	setDatos(datos?) {
		this.datos = datos ? datos.datos || datos : [];
		this.recarga();
	}

	push(value) {
		this.datos.push(value);
		this.recarga();
	}

	removerFamilia(familiaId) {
		this.datos = this.datos.filter(registro => { return registro.familiaId != familiaId });
		this.recarga();
	}

	recarga() {
		this.onDatosChanged.next(this.datos);
	}
}