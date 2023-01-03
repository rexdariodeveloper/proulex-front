import { Articulo, ArticuloComboProjection } from './articulo';

export class PADescuentoArticulo {
	public id?: number;
    public descuentoId?: number;
    public articulo?: Articulo;
    public articuloId?: number;
    public activo?: boolean;
}

export class PADescuentoArticuloEditarProjection{
	public id?: number;
    public descuentoId?: number;
    public articulo?: ArticuloComboProjection;
    public activo?: boolean;
}