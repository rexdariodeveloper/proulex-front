import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { Departamento, DepartamentoComboProjection } from '@models/departamento';
import { EstadoComboProjection } from './estado';
import { MonedaComboProjection } from './moneda';
import { PaisComboProjection } from './pais';
import { SucursalComboProjection } from './sucursal';
import { EmpleadoContacto, EmpleadoContactoEditarProjection } from './empleado-contacto';
import { PAProfesorCategoria, PAProfesorComboProjection } from './paprofesor-categoria';
import { EmpleadoCurso, EmpleadoCursoEditarProjection } from './empleado-curso';
import { EmpleadoCategoria, EmpleadoCategoriaEditarProjection  } from './empleado-categoria';
import { EmpleadoBeneficiario, EmpleadoBeneficiarioEditarProjection } from './empleado-beneficiario';
import { ControlesMaestrosMultiples } from './mapeos/controles-maestros-multiples';
import { EmpleadoDatoSaludEditarProjection } from './empleado-dato-salud';
import { EmpleadoDocumentoEditarProjection } from './empleado-documento';
import { EmpleadoHorarioEditarProjection } from './empleado-horario';
import { EmpleadoContratoEditarProjection } from './empleado-contrato';


export class Empleado {
	public id: number;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido?: string;
    public estadoCivilId: number;
    public generoId: number;
    public fechaNacimiento?: Date;
    public paisNacimientoId: number;
    public estadoNacimientoId: number;
    public rfc: string;
    public curp: string;
    public nss: string;
    public correoElectronico: string;
    public fotoId: number;
    public codigoEmpleado: string;
    public departamentoId: number;
    public fechaAlta: Date;
    public tipoEmpleadoId: number;
    public sucursalId: number;
    public domicilio: string;
    public colonia: string;
    public cp: string;
    public paisId: number;
    public estadoId: number;
    public municipio: string;
    public usuarioId: number;
    public gradoEstudiosId?: number;
    public nacionalidadId?: number;
    public fechaCreacion: Date;
    public creadoPor?: Usuario;
	public creadoPorId?: number;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public fechaUltimaModificacion?: Date;
    public contactos: EmpleadoContacto[];
    public cursos: EmpleadoCurso[];
    public categorias: EmpleadoCategoria[];
    public beneficiarios?: EmpleadoBeneficiario[];
    public estatusId: number;
    public telefonoFijo?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public img64: string;

    
}

export class EmpleadoComboProjection {
	public id?: number;
	public nombreCompleto?: string;
	public nombreCompletoSinCodigo?: string;
}

export class EmpleadoEditarProjection {
	public id?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public estadoCivil?: ControlMaestroMultipleComboProjection;
    public genero?: ControlMaestroMultipleComboProjection;
    public fechaNacimiento?: Date;
    public paisNacimiento?: PaisComboProjection;
    public estadoNacimiento?: EstadoComboProjection;
    public rfc?: string;
    public curp?: string;
    public nss?: string;
    public correoElectronico?: string;
    public fotoId?: number;
    public datosSalud?: EmpleadoDatoSaludEditarProjection[];
    public codigoEmpleado?: string;
    public departamento?: DepartamentoComboProjection;
    public fechaAlta?: Date;
    public tipoEmpleado?: ControlMaestroMultipleComboProjection;
    public sucursal?: SucursalComboProjection;
    public domicilio?: string;
    public colonia?: string;
    public cp?: string;
    public pais?: PaisComboProjection;
    public estado?: EstadoComboProjection;
    public municipio?: string;
    public gradoEstudios?: ControlMaestroMultipleComboProjection;
    public nacionalidad?: ControlMaestroMultipleComboProjection;
    public usuario?: Usuario;
    public fechaUltimaModificacion?: Date;
    public contactos?: EmpleadoContactoEditarProjection[];
    public cursos: EmpleadoCursoEditarProjection[];
    public categorias: EmpleadoCategoriaEditarProjection[];
    public beneficiarios?: EmpleadoBeneficiarioEditarProjection[];
    public estatusId: number;
    public telefonoContacto?: string;
    public telefonoMovil?: string;
    public telefonoTrabajo?: string;
    public telefonoTrabajoExtension?: string;
    public telefonoMensajeriaInstantanea?: string;
    public listaEmpleadoDocumento?: EmpleadoDocumentoEditarProjection[];
    public empleadoContrato?: EmpleadoContratoEditarProjection;
    public listaEmpleadoHorario?: EmpleadoHorarioEditarProjection[];
    public img64: string;

    constructor(empleado?){
        empleado = empleado || {};
        this.id = empleado.id || null;
        this.nombre = empleado.nombre || '';
        this.primerApellido = empleado.primerApellido || '';
        this.segundoApellido = empleado.segundoApellido || '';
        this.estadoCivil = empleado.estadoCivil || ControlMaestroMultipleComboProjection;
        this.genero = empleado.genero || ControlMaestroMultipleComboProjection;
        this.fechaNacimiento = empleado.fechaNacimiento || null;
        this.paisNacimiento = empleado.paisNacimiento || null;
        this.estadoNacimiento = empleado.estadoNacimiento || null;
        this.rfc = empleado.rfc || '';
        this.curp = empleado.curp || '';
        this.nss = empleado.nss || '';
        this.correoElectronico = empleado.correoElectronico || '';
        this.fotoId = empleado.fotoId || null;
        this.datosSalud = empleado.datosSalud || [];
        this.codigoEmpleado = empleado.codigoEmpleado || '';
        this.departamento = empleado.departamento || DepartamentoComboProjection;
        this.fechaAlta = empleado.fechaAlta || null;
        this.tipoEmpleado = empleado.tipoEmpleado || ControlMaestroMultipleComboProjection;
        this.sucursal = empleado.sucursal || SucursalComboProjection;
        this.domicilio = empleado.domicilio || '';
        this.colonia = empleado.colonia || '';
        this.cp = empleado.cp || '';
        this.pais = empleado.pais || PaisComboProjection;
        this.estado = empleado.estado || EstadoComboProjection;
        this.municipio = empleado.municipio || '';
        this.gradoEstudios = empleado.gradoEstudios || null;
        this.nacionalidad = empleado.nacionalidad || null;
        this.usuario = empleado.usuario || Usuario;
        this.fechaUltimaModificacion = empleado.fechaUltimaModificacion || null;
        this.contactos = empleado.contactos || [];
        this.cursos = empleado.cursos || [];
        this.categorias = empleado.categorias || [];
        this.beneficiarios = empleado.beneficiarios || [];
        this.estatusId = empleado.estatusId || ControlesMaestrosMultiples.CMM_EMP_Estatus.ACTIVO;
        this.telefonoContacto = empleado.telefonoContacto || '';
        this.telefonoMovil = empleado.telefonoMovil || '';
        this.telefonoTrabajo = empleado.telefonoTrabajo || '';
        this.telefonoTrabajoExtension = empleado.telefonoTrabajoExtension || '';
        this.telefonoMensajeriaInstantanea = empleado.telefonoMensajeriaInstantanea || '';
        this.listaEmpleadoDocumento = empleado.listaEmpleadoDocumento || [];
        this.empleadoContrato = empleado.empleadoContrato || null;
        this.listaEmpleadoHorario = empleado.listaEmpleadoHorario || [];
        this.img64 = empleado.img64 || '';
    }
}

export class EmpleadoBajaProjection {
	public id?: number;
    public codigoEmpleado?: string;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
}