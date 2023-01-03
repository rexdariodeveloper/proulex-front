import { Almacen, AlmacenComboProjection } from './almacen';
import { Usuario } from '@models/usuario';
import { ArticuloComboProjection } from './articulo';

export class Localidad {
	public id?: number;
    public codigoLocalidad?: string;
    public nombre?: string;
    public almacen?: Almacen;
    public almacenId?: number;
    public localidadGeneral?: boolean;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaModificacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
}

export class LocalidadListadoProjection {
	public id?: number;
    public codigoLocalidad?: string;
    public nombre?: string;
    public localidadGeneral?: boolean;
	public activo?: boolean;
	public fechaModificacion?: Date;
	public articulos?: ArticuloComboProjection[];
}

export class LocalidadComboProjection {

	id?: number;
    codigoLocalidad?: string;
    nombre?: string;
    localidadGeneral?: boolean;
    activo?: boolean;
    almacen?: AlmacenComboProjection;

}