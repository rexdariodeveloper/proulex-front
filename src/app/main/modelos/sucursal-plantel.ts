import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { Almacen, AlmacenComboProjection } from './almacen';
import { Localidad, LocalidadComboProjection } from './localidad';
import { Pais, PaisComboProjection } from './pais';
import { Estado, EstadoComboProjection } from './estado';

export class SucursalPlantel {
	public id?: number;
	public sucursalId?: number;
	public codigoSucursal?: string;
	public nombre?: string;
	public responsable?: Usuario;
	public responsableId?: number;
	public almacen?: Almacen;
	public almacenId?: number;
	public localidad?: Localidad;
	public localidadId?: number;
	public direccion?: string;
	public cp?: string;
	public colonia?: string;
	public pais?: Pais;
	public paisId?: number;
	public estado?: Estado;
	public estadoId?: number;
	public municipio?: string;
	public correoElectronico?: string;
	public telefonoFijo?: string;
	public telefonoMovil?: string;
	public telefonoTrabajo?: string;
	public telefonoTrabajoExtension?: string;
	public telefonoMensajeriaInstantanea?: string;
	public activo?: boolean;
	public fechaCreacion?: Date;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public fechaModificacion?: Date;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
}

export class SucursalPlantelEditarProjection{
	public id?: number;
	public sucursalId?: number;
	public codigoSucursal?: string;
	public nombre?: string;
	public responsable?: UsuarioComboProjection;
	public almacen?: AlmacenComboProjection;
	public localidad?: LocalidadComboProjection;
	public direccion?: string;
	public cp?: string;
	public colonia?: string;
	public pais?: PaisComboProjection;
	public estado?: EstadoComboProjection;
	public municipio?: string;
	public correoElectronico?: string;
	public telefonoFijo?: string;
	public telefonoMovil?: string;
	public telefonoTrabajo?: string;
	public telefonoTrabajoExtension?: string;
	public telefonoMensajeriaInstantanea?: string;
	public activo?: boolean;

	// Campos para usar solo en front
    public idTmp?: number;
}

export class SucursalPlantelComboProjection{
	public id?: number;
	public nombre?: string;
	public codigoSucursal?: string;
}