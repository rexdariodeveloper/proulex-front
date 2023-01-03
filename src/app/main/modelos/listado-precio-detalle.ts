import { Articulo, ArticuloComboProjection } from './articulo';
import { ListadoPrecioDetalleCurso } from './listado-precio-detalle-curso';

export class ListadoPrecioDetalle {
	public id?:number;
    public listadoPrecioId?:number;
    public padreId?:number;
    public precio?:number;
    public articulo?:Articulo;
    public articuloId?:number;
    public hijos: ListadoPrecioDetalle[];
    public detallesCurso?: ListadoPrecioDetalleCurso[];
}

export class ListadoPrecioDetalleEditarProjection{
	public id?:number;
    public listadoPrecioId?:number;
    public padreId?:number;
    public precio?:number;
    public articulo?:ArticuloComboProjection;
    public hijos: ListadoPrecioDetalleEditarProjection[];	
}