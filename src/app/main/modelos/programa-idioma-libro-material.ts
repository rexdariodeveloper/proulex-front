import { Usuario } from '@models/usuario';
import { Articulo, ArticuloComboProjection } from './articulo';
import { ProgramaIdiomaLibroMaterialRegla, ProgramaIdiomaLibroMaterialReglaEditarProjection } from './programa-idioma-libro-material-regla';

export class ProgramaIdiomaLibroMaterial {
	public id: number;
    public programaIdiomaId: number;
    public nivel: number;
    public articuloId: number;
    public borrado: boolean;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class ProgramaIdiomaLibroMaterialEditarProjection {
	public id?: number;
	public programaIdiomaId?: number;
	public nivel?: number;
	public articulo?: ArticuloComboProjection;
    public borrado?: boolean;
    public reglas?: ProgramaIdiomaLibroMaterialReglaEditarProjection[];
}