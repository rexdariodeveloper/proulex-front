import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { UsuarioComboProjection } from "@models/usuario";
import { AlumnoCapturaProjection } from "./alumno";
import { ProgramaGrupoEditarProjection } from "./programa-grupo";

export class AlumnoAsistencia {
	public id: number;
    public alumnoId: number;
    public alumno?: AlumnoCapturaProjection;
    public grupoId: number;
    public grupo?: ProgramaGrupoEditarProjection;
    public fecha: Date;
    public tipoAsistenciaId: number;
    public tipoAsistencia?: ControlMaestroMultipleComboProjection;
    public comentario: string;
    public minutosRetardo: number;
    public motivoJustificante: string;
    public fechaCreacion: Date;
    public creadoPor: UsuarioComboProjection;
    public creadoPorId: number;
    public modificadoPor: UsuarioComboProjection;
    public modificadoPorId: number;
    public fechaModificacion: Date;

    constructor() {
        this.id = null;
        this.alumnoId = null;
        this.alumno = null;
        this.grupoId = null;
        this.grupo = null;
        this.fecha = null;
        this.tipoAsistenciaId = null;
        this.tipoAsistencia = null;
        this.comentario = null;
        this.minutosRetardo = null;
        this.motivoJustificante = null;
        this.fechaCreacion = null;
        this.creadoPor = null;
        this.creadoPorId = null;
        this.modificadoPor = null;
        this.modificadoPorId = null;
        this.fechaModificacion = null;
    }

    setComentario(comentario: string): void {
        this.comentario = comentario.trim();
    }
    setJustificante(justificante: string): void {
        this.motivoJustificante = justificante.trim();
    }
}