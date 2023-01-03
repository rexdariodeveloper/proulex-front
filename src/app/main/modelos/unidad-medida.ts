import { Usuario } from '@models/usuario';

export class UnidadMedida {
	public id?: number;
    public nombre?: string;
    public clave?: string;
    public claveSAT?: string;
    public activo?: boolean;
	
	public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class UnidadMedidaComboProjection {
	id?: number;
    nombre?: string;
}

export class UnidadMedidaListadoProjection {

	id?: number;
    nombre?: string;
    clave?: string;
    claveSAT?: string;
    decimales?: number;
    fechaModificacion?: Date;

}