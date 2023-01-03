import { Usuario } from "@models/usuario";
import { Articulo, ArticuloArbolComponentesProjection, ArticuloComboProjection } from "./articulo";

export class ArticuloComponente {

	public id?: number;
    public articulo?: Articulo;
    public articuloId?: number;
    public componente?: Articulo;
    public componenteId?: number;
    public cantidad?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;

}

export class ArticuloComponenteEditarProjection {

	public id?: number;
    public articulo?: ArticuloComboProjection;
    public componente?: ArticuloComboProjection;
    public cantidad?: number;
    public fechaModificacion?: Date;

}

export class ArticuloComponenteArbolProjection {
	public id?: number;
    public cantidad?: number;
    public componente?: ArticuloArbolComponentesProjection;
}