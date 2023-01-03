import { ProgramaIdioma,ProgramaIdiomaComboProjection } from './programa-idioma';

export class ProgramaIdiomaDescuentoDetalle {
	public id?: number;
    public descuentoDetalleId?: number;
    public programaIdioma?: ProgramaIdioma;
    public programaIdiomaId?: number;	
}

export class ProgramaIdiomaDescuentoDetalleEditarProjection{
	public id?: number;
    public descuentoDetalleId?: number;
    public programaIdioma?: ProgramaIdiomaComboProjection;
}
