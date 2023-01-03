import { ArticuloCategoria, ArticuloCategoriaComboProjection } from './articulo-categoria';
import { Usuario } from '@models/usuario';
import { ArticuloFamiliaComboProjection } from './articulo-familia';

export class ArticuloSubcategoria {
	public id?: number;
    public categoria?: ArticuloCategoria;
    public categoriaId?: number;
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

export class ArticuloSubcategoriaComboProjection {

	id?: number;
	nombre?: string;
	categoria?: ArticuloCategoriaComboProjection;

}

export class ArticuloSubcategoriaCardProjection {

    public id?: number;
    public nombre?: string;
    public imagenId?: number;

}