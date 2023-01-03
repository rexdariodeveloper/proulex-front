import { Sucursal, SucursalComboProjection } from './sucursal';
import { ProgramaIdiomaEditarProjection, ProgramaIdioma, ProgramaIdiomaComboProjection } from './programa-idioma';
import { ProgramacionAcademicaComercial, ProgramacionAcademicaComercialEditarProjection, ProgramacionAcademicaComercialComboProjection } from './programacion-academica-comercial';
import { PAModalidad,PAModalidadComboProjection } from './pamodalidad';
import { PAModalidadHorario, PAModalidadHorarioComboProjection } from './pamodalidad-horario';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Empleado, EmpleadoComboProjection } from './empleado';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { ProgramaGrupoListadoClase, ProgramaGrupoListadoClaseEditarProjection } from './programa-grupo-listado-clase';
import { SucursalPlantel, SucursalPlantelEditarProjection } from './sucursal-plantel';
import { PACiclo, PACicloComboProjection } from './paciclo';
import { ProgramaGrupoProfesor, ProgramaGrupoProfesorListadoGrupoProjection } from './programa-grupo-profesor';
import { ProgramaGrupoIncompanyClaseCancelada, ProgramaGrupoIncompanyClaseCanceladaEditarProjection } from './programa-grupo-incompany-clase-cancelada';
import { ProgramaGrupoIncompanyHorario, ProgramaGrupoIncompanyHorarioEditarProjection } from './programa-grupo-incompany-horario';
import { ProgramaGrupoIncompanyClaseReprogramada, ProgramaGrupoIncompanyClaseReprogramadaEditarProjection } from './programa-grupo-incompany-clase-reprogramada';
import { ProgramaGrupoIncompanyCriterioEvaluacion, ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection } from './programa-grupo-incompany-criterio-evaluacion';
import { ProgramaGrupoIncompanyMaterial, ProgramaGrupoIncompanyMaterialEditarProjection } from './programa-grupo-incompany-material';
import { ProgramaGrupoEvidencia } from './programa-grupo-evidencia';
import { PrecioIncompany,PrecioIncompanyComboProjection } from './precio-incompany';
import { ProgramaGrupoIncompanyComisionEditarProjection } from './programa-grupo-incompany-comision';

export class ProgramaGrupo {
	public id: number;
    public sucursal: Sucursal;
    public sucursalId: number;
    public programaIdioma: ProgramaIdioma;
    public programaIdiomaId: number;
    public paModalidad: PAModalidad;
    public paModalidadId: number;
    public programacionAcademicaComercial: ProgramacionAcademicaComercial;
    public programacionAcademicaComercialId: number;
    public fechaInicio: Date;
    public fechaFin: Date;
    public nivel: number;
    public grupo: string;
    public plataforma: ControlMaestroMultiple;
    public plataformaId: number;
    public modalidadHorario: PAModalidadHorario;
    public modalidadHorarioId: number;
    public tipoGrupo: ControlMaestroMultiple;
    public tipoGrupoId: number;
    public sucursalPlantel?: SucursalPlantel;
    public cupo: number;
    public empleado: Empleado;
    public empleadoId: number;
    public listadoClases?: ProgramaGrupoListadoClase[];
    public estatus?: ControlMaestroMultiple;
    public multisede?: boolean;
    public fechaCreacion: Date;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
    public paCiclo: PACiclo;
    public calificacionMinima?: number;
    public faltasPermitidas?: number;
    public categoriaProfesor?: string;
    public sueldoProfesor?: number;
    public aula?: string;
    public comentarios?: string;
    public profesoresTitulares?: ProgramaGrupoProfesor[];

    public nuevoProfesorTitular?: Empleado;

    //Datos Incompany
    public horarios: ProgramaGrupoIncompanyHorario[];
    public criteriosEvaluacion: ProgramaGrupoIncompanyCriterioEvaluacion[];
    public clasesCanceladas: ProgramaGrupoIncompanyClaseCancelada[];
    public clasesReprogramadas: ProgramaGrupoIncompanyClaseReprogramada[];
    public materiales: ProgramaGrupoIncompanyMaterial[];
    public alias?: string;
    public codigo?: string;
    public nombre?: string;
    public precioIncompany?: PrecioIncompany;
    public precioVentaGrupo?: number;
    public clientePrecioVentaCurso?: number;
    public clientePrecioVentaLibro?: number;
    public clientePrecioVentaCertificacion?: number;
    public precioVentaCurso?: number;
    public precioVentaLibro?: number;
    public precioVentaCertificacion?: number;
    public porcentajeComision?: number;
    public porcentajeApoyoTransporte?: number;
    public kilometrosDistancia?: number;
    public precioMaterial?: number;
    public listaComision?: ProgramaGrupoIncompanyComisionEditarProjection[];
}

export class ProgramaGrupoEditarProjection{
    public id?: number;
    public sucursal?: SucursalComboProjection;
    public codigo?: string;
    public programaIdioma?: ProgramaIdiomaComboProjection;
    public paModalidad?: PAModalidadComboProjection;
    public programacionAcademicaComercial?: ProgramacionAcademicaComercialComboProjection;
    public fechaInicio?: Date;
    public fechaFin?: Date;
    public nivel?: number;
    public grupo?: string;
    public plataforma?: ControlMaestroMultipleComboProjection;
    public modalidadHorario?: PAModalidadHorarioComboProjection;
    public tipoGrupo?: ControlMaestroMultipleComboProjection;
    public sucursalPlantel?: SucursalPlantelEditarProjection;
    public cupo?: number;
    public empleado?: EmpleadoComboProjection;
    public listadoClases?: ProgramaGrupoListadoClaseEditarProjection[];
    public estatus?: ControlMaestroMultipleComboProjection;
    public multisede?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: UsuarioComboProjection;
    public fechaModificacion?: Date;
    public paCiclo?: PACicloComboProjection;
    public calificacionMinima?: number;
    public faltasPermitidas?: number;
    public categoriaProfesor?: string;
    public sueldoProfesor?: number;
    public aula?: string;
    public comentarios?: string;
    public profesoresTitulares?: ProgramaGrupoProfesorListadoGrupoProjection[];

    public nuevoProfesorTitular?: EmpleadoComboProjection;

    public fechaFinInscripciones?: Date;
    public fechaFinInscripcionesBecas?: Date;

    //Datos Incompany
    public horarios: ProgramaGrupoIncompanyHorarioEditarProjection[];
    public criteriosEvaluacion: ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection[];
    public clasesCanceladas: ProgramaGrupoIncompanyClaseCanceladaEditarProjection[];
    public clasesReprogramadas: ProgramaGrupoIncompanyClaseReprogramadaEditarProjection[];
    public materiales: ProgramaGrupoIncompanyMaterialEditarProjection[];
    public alias?: string;
    public nombre?: string;
    public precioIncompany?: PrecioIncompanyComboProjection;
    public precioVentaGrupo?: number;
    public clientePrecioVentaCurso?: number;
    public clientePrecioVentaLibro?: number;
    public clientePrecioVentaCertificacion?: number;
    public precioVentaCurso?: number;
    public precioVentaLibro?: number;
    public precioVentaCertificacion?: number;
    public porcentajeComision?: number;
    public porcentajeApoyoTransporte?: number;
    public kilometrosDistancia?: number;
    public precioMaterial?: number;

    public evidencias?: ProgramaGrupoEvidencia[];
    public listaComision?: ProgramaGrupoIncompanyComisionEditarProjection[];
}

export class ProgramaGrupoCardProjection {

    public id?: number;
    public nombre?: string;
    public numeroGrupo?: number;
    public fechaInicio?: any;
    public fechaFin?: any;
    public horario?: string;
    public color?: string;
    public articuloId?: number;
    public nivel?: number;
    public permiteInscripcion?: boolean;
    public esMultisede?: boolean;
    public sucursalId?: number;
    public sucursalNombre?: string;

}

export class ProgramaGrupoComboProjection {

    public id?: number;
    public codigo?: string;
    public nombreGrupo?: string;
    public sucursalId?: number;
    public nombreSucursal?: string;

}

export class ProgramaGrupoCapturaEditarProjection {
    id?: number;
    codigo?: string;
    sede?: string;
    idioma?: string;
    modalidad?: string;
    nivel?: string;
    grupo?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    profesor?: string;
    horario?: string;
    faltasPermitidas?: number;
    faltasDesertor?: number;
    incompany?: boolean;
    jobs?: boolean;
    sems?: boolean;
    pcp?: boolean;
    estatusId: number;
    fechaFinTolerancia: Date;
}

export class ProgramaGrupoReaperturaGrupoProjection{
    id?: number;
    sede?: string;
    programa?: string;
    idioma?: string;
    nivel?: string;
    horario?: string;
    fechaInicio?: Date;
    fechaFinInscripcion?: Date;
    fechaFinInscripcionBeca?: Date;
}