import { Archivo, ArchivoProjection } from "@models/archivo";
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { Usuario } from "@models/usuario";
import { AlumnoContacto, AlumnoContactoEditarProjection } from "./alumno-contacto";
import { AlumnoDatosFacturacion } from "./alumno-datos-facturacion";
import { Estado, EstadoComboProjection } from "./estado";
import { MunicipioComboProjection } from "./municipio";
import { Pais, PaisComboProjection } from "./pais";
import { Sucursal, SucursalComboProjection } from "./sucursal";

export class Alumno {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public codigoUDG?: string;
    public codigoUDGAlterno?: string;
    public fechaNacimiento?: Date;
    public paisNacimiento?: Pais;
    public paisNacimientoId?: number;
    public estadoNacimiento?: Estado;
    public estadoNacimientoId?: number;
    public ciudadNacimiento?: string;
    public genero?: ControlMaestroMultiple;
    public generoId?: number;
    public curp?: string;
    public empresaOEscuela?: string;
    public problemaSaludOLimitante?: string;
    public alumnoJOBS?: boolean;
    public programaJOBS?: ControlMaestroMultiple;
    public programaJOBSId?: number;
    public centroUniversitarioJOBS?: ControlMaestroMultiple;
    public centroUniversitarioJOBSId?: number;
    public preparatoriaJOBS?: ControlMaestroMultiple;
    public preparatoriaJOBSId?: number;
    public carreraJOBS?: ControlMaestroMultiple;
    public carreraJOBSId?: number;
    public bachilleratoTecnologico?: string;
    public foto?: Archivo;
    public fotoId?: number;
    public domicilio?: string;
    public colonia?: string;
    public cp?: string;
    public pais?: Pais;
    public paisId?: number;
    public estado?: Estado;
    public estadoId?: number;
    public ciudad?: string;
    public correoElectronico?: string;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public codigoAlumnoUDG?: string;
    public grupo?: string;
    public grado?: ControlMaestroMultiple;
    public gradoId?: number;
    public turno?: ControlMaestroMultiple;
    public turnoId?: number;
    public tipoAlumno: ControlMaestroMultiple;
    public tipoAlumnoId: number;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaModificacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public folio?: string;
    public dependencia?: string;
    public referencia?: string;
    public contactos?: AlumnoContacto[];
    public facturacion?: AlumnoDatosFacturacion[];
}

export class AlumnoListadoProjection {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public apellidos?: string;
    public edad?: string;
    public correoElectronico?: string;
    public telefono?: string;
    public sucursalNombre?: string;
    public activo?: boolean;

}

export class AlumnoEditarProjection {

    public id: number;
    public codigo: string;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido?: string;
    public sucursal?: SucursalComboProjection;
    public codigoUDG?: string;
    public codigoUDGAlterno?: string;
    public fechaNacimiento?: Date;
    public paisNacimiento?: PaisComboProjection;
    public estadoNacimiento?: EstadoComboProjection;
    public ciudadNacimiento?: string;
    public municipioNacimiento?: MunicipioComboProjection;
    public genero: ControlMaestroMultipleComboProjection;
    public curp?: string;
    public empresaOEscuela?: string;
    public problemaSaludOLimitante?: string;
    public medioEnteradoProulex?: ControlMaestroMultipleComboProjection;
    public razonEleccionProulex?: ControlMaestroMultipleComboProjection;
    public alumnoJOBS: boolean;
    public programaJOBS?: ControlMaestroMultipleComboProjection;
    public centroUniversitarioJOBS?: ControlMaestroMultipleComboProjection;
    public preparatoriaJOBS?: ControlMaestroMultipleComboProjection;
    public carreraJOBS?: ControlMaestroMultipleComboProjection;
    public bachilleratoTecnologico?: string;
    public foto?: ArchivoProjection;
    public fotoId?: number;
    public domicilio?: string;
    public colonia?: string;
    public cp?: string;
    public pais?: PaisComboProjection;
    public estado?: EstadoComboProjection;
    public ciudad?: string;
    public municipio?: MunicipioComboProjection;
    public correoElectronico?: string;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public codigoAlumnoUDG?: string;
    public grupo?: string;
    public grado?: ControlMaestroMultipleComboProjection;
    public turno?: ControlMaestroMultipleComboProjection;
    public tipoAlumno: ControlMaestroMultipleComboProjection;
    public activo: boolean;
    public fechaCreacion: Date;
    public fechaModificacion?: Date;
    public folio?: string;
    public dependencia?: string;
    public referencia?: string;
    public contactos: AlumnoContactoEditarProjection[];
    public facturacion: AlumnoDatosFacturacion[];

    public constructor() {
        this.id = null;
        this.codigo = null;
        this.nombre = null;
        this.primerApellido = null;
        this.segundoApellido = null;
        this.sucursal = null;
        this.codigoUDG = null;
        this.codigoUDGAlterno = null;
        this.fechaNacimiento = null;
        this.paisNacimiento = null;
        this.estadoNacimiento = null;
        this.ciudadNacimiento = null;
        this.municipioNacimiento = null;
        this.genero = null;
        this.curp = null;
        this.empresaOEscuela = null;
        this.problemaSaludOLimitante = null;
        this.medioEnteradoProulex = null;
        this.razonEleccionProulex = null;
        this.alumnoJOBS = false;
        this.programaJOBS = null;
        this.centroUniversitarioJOBS = null;
        this.preparatoriaJOBS = null;
        this.carreraJOBS = null;
        this.bachilleratoTecnologico = null;
        this.foto = null;
        this.fotoId = null;
        this.domicilio = null;
        this.colonia = null;
        this.cp = null;
        this.pais = null;
        this.estado = null;
        this.ciudad = null;
        this.municipio = null;
        this.correoElectronico = null;
        this.telefonoFijo = null;
        this.telefonoMovil = null;
        this.telefonoTrabajo = null;
        this.telefonoTrabajoExtension = null;
        this.telefonoMensajeriaInstantanea = null;
        this.codigoAlumnoUDG = null;
        this.grupo = null;
        this.grado = null;
        this.turno = null;
        this.tipoAlumno = null;
        this.activo = null;
        this.fechaCreacion = null;
        this.fechaModificacion = null;
        this.folio = null;
        this.dependencia = null;
        this.referencia = null;
        this.contactos = [];
        this.facturacion = [];
    }

}

export class AlumnoComboProjection {

    public id?: number;
    public codigo?: string;
    public nombre?: string;

}

export class AlumnoCapturaProjection {

    public id?: number;
    public codigo?: string;
    public codigoAlumnoUDG?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
}


export class AlumnoReinscripcionProjection {

    id?: number;
    codigo?: string;
    becaId?: number;
    becaCodigo?: string;
    codigoUDG?: string;
    codigoUDGAlterno?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    curso?: string;
    modalidad?: string;
    horario?: string;
    nivelReinscripcion?: number;
    calificacion?: number;
    idiomaId?: number;
    programaId?: number;
    modalidadId?: number;
    horarioId?: number;
    sucursalId?: number;
    articuloId?: number;
    numeroGrupo?: number;
    grupoReinscripcionId?: number;
    grupoReinscripcionCodigo?: string;
    aprobado?: boolean;

    // datos utilizados en PV
    comentario: string;
    nivelReasignado?: number;
    jsonEdicionInscripcion?: {nivel: number, modalidadId: number, modalidad: string, horarioId: number, horario: string, comentario: string};

}

export class AlumnoListadoGrupoProjection{
    id?: number;
    codigo?: string;
    codigoUDG?: string;
    codigoUDGAlterno?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    fechaNacimiento?: Date;
    correoElectronico?: string;
    telefonoFijo?: string;
    codigoAlumnoUDG?: string;
    centroUniversitarioJOBS?: ControlMaestroMultipleComboProjection;
    preparatoriaJOBS?: ControlMaestroMultipleComboProjection;
    carreraJOBS?: ControlMaestroMultipleComboProjection;
    bachilleratoTecnologico?: string;
    foto?: ArchivoProjection;
    activo?: boolean;
}

export class AlumnoEntregarLibrosProjection {

    public id?: number;
    public fotoId?: number;
    public codigo?: string;
    public codigoUDG?: string;
    public codigoUDGAlterno?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public grupoId?: number;
    public grupo?: string;
    public libros?: string;
    public inscripcionEstatusId?: number;
    public inscripcion?: string;
    public inscripcionId?: number;
    public inscripcionSinGrupoId?: number;
    public ordenVentaId?: number;
    public ordenVentaCodigo?: string;

}

export class AlumnoInscripcionesPendientesJOBSProjection {

    public id?: number;
    public codigo?: string;
    public codigoAlumnoUDG?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public centroUniversitario?: string;
    public carrera?: string;
    public grupoId?: number;
    public grupo?: string;
    public idiomaId?: number;

    // datos utilizados en PV
    public localidadId: number;
    public idTmp: number;

}

export class AlumnoInscripcionesPendientesJOBSSEMSProjection {

    public id?: number;
    public codigo?: string;
    public codigoAlumnoUDG?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public preparatoria?: string;
    public bachilleratoTecnologico?: string;
    public grupoId?: number;
    public grupo?: string;
    public esCandidato?: boolean;
    public idiomaId?: number;

    // datos utilizados en PV
    public localidadId: number;
    public idTmp: number;

}

export class AlumnoInscripcionPendientePCPProjection {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public dependencia?: string;
    public curso?: string;
    public grupoId?: number;
    public grupo?: string;
    public esCandidato?: boolean;
    public idiomaId?: number;

    // datos utilizados en PV
    public localidadId: number;
    public idTmp: number;

}