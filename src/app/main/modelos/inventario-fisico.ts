import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { InventarioFisicoDetalle } from './inventario-fisico-detalle';
import { Localidad } from './localidad';

export class InventarioFisico {

	public id?: number;
	public codigo?: string;
	public fecha?: Date;
	public localidadId?: number;
	public localidad?: Localidad;
	public estatusId?: number;
	public estatus?: ControlMaestroMultiple;
	public afectadoPorId?: number;
	public afectadoPor?: any;
	public fechaAfectacion?: Date;
	public creadoPorId?: number;
	public creadoPor?: any;
	public modificadoPorId?: number;
	public fechaCreacion?: Date;
	public fechaModificacion?: Date;

	public inventarioFisicoDetalles: InventarioFisicoDetalle[];
}

export class InventarioFisicoProjection {

	public id?: number;
	public codigo?: string;
	public fecha?: string;
	public fechaAfectacion?: Date;
	public fechaModificacion?: Date;
	public localidad?: Localidad;
	public estatusId?: number;

	public inventarioFisicoDetalles: InventarioFisicoDetalle[];
	public afectar?: boolean;

	public fechaCreacionTemp?: any;

	constructor(object: any, detalles?: any) {

		this.id = object.id || null;
		this.codigo = object.codigo || null;
		this.fecha = object.fecha || null;
		this.fechaAfectacion = object.fechaAfectacion || null;
		this.fechaModificacion = object.fechaModificacion || null;
		this.localidad = object.localidad || null;
		this.estatusId = object.estatusId || null;
		
		this.inventarioFisicoDetalles = detalles || [];
		
		this.fechaCreacionTemp = object.fechaCreacionTemp || null;
	}
}