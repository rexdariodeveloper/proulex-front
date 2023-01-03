import { ControlMaestroMultiple } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { Alumno } from "./alumno";
import { OrdenVentaDetalle } from "./orden-venta-detalle";
import { PAModalidad } from "./pamodalidad";
import { PAModalidadHorario } from "./pamodalidad-horario";
import { Programa } from "./programa";
import { Sucursal } from "./sucursal";

export class InscripcionSinGrupo {

    public id?: number;
    public ordenVentaDetalle?: OrdenVentaDetalle;
    public ordenVentaDetalleId?: number;
    public alumno?: Alumno;
    public alumnoId?: number;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public programa?: Programa;
    public programaId?: number;
    public idioma?: ControlMaestroMultiple;
    public idiomaId?: number;
    public paModalidad?: PAModalidad;
    public paModalidadId?: number;
    public paModalidadHorario?: PAModalidadHorario;
    public paModalidadHorarioId?: number;
    public nivel?: number;
    public grupo?: number;
    public comentario?: string;
    public estatus?: ControlMaestroMultiple;
    public estatusId?: number;
    public fechaCreacion?: any;
    public fechaModificacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;

}

export class InscripcionSinGrupoListadoProjection {

    public id?: number;
    public alumnoId?: number;
    public ordenVentaDetalleId?: number;
    public alumnoCodigo?: string;
    public alumnoCodigoUDG?: string;
    public alumnoNombre?: string;
    public alumnoPrimerApellido?: string;
    public alumnoSegundoApellido?: string;
    public curso?: string;
    public nivel?: number;
    public paModalidadNombre?: string;
    public montoPago?: number;
    public medioPago?: string;
    public estatusId?: number;
    public estatus?: string;
    public ovCodigo?: string;

}