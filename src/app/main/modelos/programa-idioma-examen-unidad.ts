import { ProgramaIdiomaLibroMaterial, ProgramaIdiomaLibroMaterialEditarProjection } from './programa-idioma-libro-material';

export class ProgramaIdiomaExamenUnidad{
	public id?: number;
    public examenDetalleId?: number;
    public libroMaterial?: ProgramaIdiomaLibroMaterial;
    public libroMaterialId?: number;
    public descripcion?: string;
}

export class ProgramaIdiomaExamenUnidadEditarProjection{
	public id?: number;
    public examenDetalleId?: number;
    public libroMaterial?: ProgramaIdiomaLibroMaterialEditarProjection;
    public descripcion?: string;
}
