import { Articulo, ArticuloComboProjection } from './articulo';

export class ProgramaGrupoIncompanyMaterial {
	public id?: number;
    public grupoId?: number;
    public articulo?: Articulo;
    public articuloId?: number;
}

export class ProgramaGrupoIncompanyMaterialEditarProjection{
	public id?: number;
    public grupoId?: number;
    public articulo?: ArticuloComboProjection;
}