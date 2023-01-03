import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';

export class MenuListadoGeneral {
	public id: number;
	public nodoPadreId?: number;
	public titulo: string;
	public tituloEN: string;
	public activo?: boolean;
	public icono?: string;
	public orden: number;
	public tipoNodo?: ControlMaestroMultiple;
	public tipoNodoId?: number;
	public nombreTablaCatalogo?: string;
	public cmmControlCatalogo?: string;
	public permiteBorrado?: boolean;
	public urlAPI?: string;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
	public fechaCreacion?: Date;
	
	// Trancient
	children?: MenuListadoGeneral[]; // para crear arbol en vista de Menu Listados Generales

}