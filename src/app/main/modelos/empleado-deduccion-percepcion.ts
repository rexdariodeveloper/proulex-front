import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { DeduccionPercepcion, DeduccionComboProjection } from './deduccion-percepcion';
import { Empleado, EmpleadoComboProjection } from './empleado';
import { Sucursal, SucursalComboProjection } from './sucursal';
import { EmpleadoDeduccionPercepcionDocumento, EmpleadoDeduccionPercepcionDocumentoEditarProjection } from './empleado-deduccion-percepcion-documento';

export class EmpleadoDeduccionPercepcion {
	public id?: number;
    public codigo?: string;
    public empleado?: Empleado;
    public empleadoId?: number;
    public fecha?: Date;
    public tipoMovimiento?: ControlMaestroMultiple;
    public tipoMovimientoId?: number;
    public deduccionPercepcion?: DeduccionPercepcion;
    public deduccionPercepcionId?: number;
    public valorFijo?: number;
    public cantidadHoras?: number;
    public total?: number;
    public activo?: boolean;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public documentos: EmpleadoDeduccionPercepcionDocumento[];
}

export class EmpleadoDeduccionPercepciónEditarProjection{
	public id?: number;
    public codigo?: string;
    public empleado?: EmpleadoComboProjection;
    public fecha?: Date;
    public tipoMovimiento?: ControlMaestroMultiple;
    public deduccionPercepcion?: DeduccionComboProjection;
    public valorFijo?: number;
    public cantidadHoras?: number;
    public total?: number;
    public activo?: boolean;
    public documentos: EmpleadoDeduccionPercepcionDocumento[];
    public sucursal?: SucursalComboProjection;
}