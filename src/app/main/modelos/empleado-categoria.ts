import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PAProfesorCategoria, PAProfesorComboProjection } from './paprofesor-categoria';

export class EmpleadoCategoria {
	public id?: number;
    public empleadoId?: number;
    public idioma?: ControlMaestroMultiple;
    public idiomaId?: number;
    public categoria?: PAProfesorCategoria;
    public categoriaId?: number;
    public activo?: boolean;
}

export class EmpleadoCategoriaEditarProjection{
	public id?: number;
	public empleadoId?: number;
	public idioma?: ControlMaestroMultipleComboProjection;
	public categoria?: PAProfesorComboProjection;
	public activo?: boolean;
}