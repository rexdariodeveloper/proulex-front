import { Usuario } from '@models/usuario';
import { ListadoPrecioDetalle, ListadoPrecioDetalleEditarProjection } from './listado-precio-detalle';
import { Moneda, MonedaComboProjection } from './moneda';

export class ListadoPrecio {
	public id?:number;
    public codigo?:number;
    public nombre?:string;
    public fechaInicio?:Date;
    public fechaFin?:Date;
    public indeterminado?:boolean;
    public moneda?: Moneda;
    public monedaId?: number;
    public activo?:boolean;
    public fechaCreacion?:Date;
    public creadoPor?:Usuario;
    public creadoPorId?:number;
    public modificadoPor?:Usuario;
    public modificadoPorId?:number;
    public fechaModificacion?:Date;
    public detalles:ListadoPrecioDetalle[];
}

export class ListadoPrecioEditarProjection{
	public id?:number;
    public codigo?:number;
    public nombre?:string;
    public fechaInicio?:Date;
    public fechaFin?:Date;
    public indeterminado?:boolean;
    public moneda?: MonedaComboProjection;
    public activo?:boolean;
    public detalles:ListadoPrecioDetalleEditarProjection[];
}

export class ListadoPrecioComboProjection{
    public id?:number;
    public nombre?:string;
}