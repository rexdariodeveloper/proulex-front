import { Usuario } from '@models/usuario';
import { ArticuloFamilia, ArticuloFamiliaComboProjection } from './articulo-familia';

export class ArticuloCategoria {
	public id?: number;
    public familia?: ArticuloFamilia;
    public familiaId?: number;
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

export class ArticuloCategoriaComboProjection {

	id?: number;
	nombre?: string;
	familia?: ArticuloFamiliaComboProjection;

}

export class ArticuloCategoriaCardProjection {

    public id?: number;
    public nombre?: string;
    public imagenId?: number;

}