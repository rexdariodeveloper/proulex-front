import { PAProfesorCategoria, PAProfesorComboProjection } from './paprofesor-categoria'; 

export class TabuladorDetalle {
	public id?: number;
    public tabuladorId?: number;
    public profesorCategoria?: PAProfesorCategoria;
    public profesorCategoriaId?: number;
    public sueldo?: number;
    public activo?: boolean;
}

export class TabuladorDetalleEditarProjection{
	public id?: number;
    public tabuladorId?: number;
    public profesorCategoria?: PAProfesorComboProjection;
    public sueldo?: number;
    public activo?: boolean;
}

export class TabuladorDetalleComboProjection {
    public id?: number;
    public tabuladorId?: number;
    public profesorCategoria?: PAProfesorComboProjection;
    public sueldo?: number;
}