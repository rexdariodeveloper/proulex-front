import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FacturasService {

	datos: any;
	onDatosChanged: BehaviorSubject<any>;

	constructor() {
		// Set the defaults
		this.onDatosChanged = new BehaviorSubject({});
	}

	getDatos() {
		if (!this.datos) {
			this.setDatos();
		}

		return this.datos;
	}

	setDatos(datos?) {
		this.datos = datos ? datos.datos || datos : [];
		this.recarga();
	}

	recarga() {
		this.onDatosChanged.next(this.datos);
	}
}