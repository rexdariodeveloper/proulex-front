import { Usuario } from '@models/usuario';

export class ArticuloFamilia {
	public id?: number;
    public nombre?: string;
    public descripcion?: string;
    public activo?: boolean;
	
	public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class ArticuloFamiliaComboProjection {

	id?: number;
    nombre?: string;

}

export class ArticuloFamiliaCardProjection {

    public id?: number;
    public nombre?: string;
    public imagenId?: number;

}