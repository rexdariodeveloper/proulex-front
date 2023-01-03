import { Usuario } from '@models/usuario';
import { ArticuloComboProjection } from './articulo';

export class ProgramaIdiomaCertificacion {
	public id: number;
    public programaIdiomaId: number;
    public nivel: string;
    public certificacionId: number;
    public precio: number;
    public borrado: boolean;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class ProgramaIdiomaCertificacionEditarProjection{
	public id?: number;
    public programaIdiomaId?: number;
    public nivel?: string;
    public certificacion?: ArticuloComboProjection;
    public precio?: number;
    public borrado?: boolean;
}

export class ProgramaIdiomaCertificacionComboProjection{
    public id?: number;
    public nombreArticulo?: string;
}