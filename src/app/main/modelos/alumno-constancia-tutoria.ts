import { Usuario } from "@models/usuario";
import { Articulo, ArticuloComboProjection } from "./articulo";
import { Alumno, AlumnoComboProjection } from "./alumno";

export class AlumnoConstanciaTutoria {
	public id?: number;
    public alumno?: Alumno;
    public alumnoId?: number;
    public articulo?: Articulo;
    public articuloId?: number;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
}

export class AlumnoConstanciaTutoriaEditarProjection{
	public id?: number;
    public alumno?: AlumnoComboProjection;
    public articulo?: ArticuloComboProjection;
    public fechaModificacion?: Date;
}