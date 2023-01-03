import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { Pais } from './pais';
import { Estado } from './estado';
import { AlmacenComboProjection } from './almacen';
import { ListadoPrecio } from './listado-precio';
import { MedioPagoPV } from './medio-pago-pv';
import { SucursalPlantel, SucursalPlantelEditarProjection } from './sucursal-plantel';
import { Cuenta } from './cuentas';


export class Sucursal {
	public id?: number;
	public codigoSucursal?: string;
	public nombre?: string;
	public prefijo?: string;
	public serie?: string;
	public responsableId?: number;
	public responsable?: Usuario;
	public coordinadorId?: number;
	public coordinador?: Usuario;
	public domicilio?: string;
	public colonia?: string;
	public paisId?: number;
	public pais?: Pais;
	public estadoId?: number;
	public estado?: Estado;
	public ciudad?: string;
	public cp?: string;
	public telefono?: string;
	public extension?: string;
	public porcentajeComision?: number;
	public presupuestoSemanal?: number;
	public predeterminada?: boolean;
	public activo?: boolean;
	public tipoSucursal?: ControlMaestroMultipleComboProjection;
	public almacenesHijos?: AlmacenComboProjection[];
	public tipoSucursalId?: number;
	public fechaCreacion?: Date;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public fechaModificacion?: Date;
	public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public mostrarRed?: boolean;
    public nombreRed?: string;
    public contraseniaRed?: string;
    public lunes?: boolean;
    public martes?: boolean;
    public miercoles?: boolean;
    public jueves?: boolean;
    public viernes?: boolean;
    public sabado?: boolean;
    public domingo?: boolean;
    public plantelesBandera?: boolean;
    public listadoPrecio?: ListadoPrecio;
	public listadoPrecioId?: number;
    public cuentaBancaria?: Cuenta;
	public cuentaBancariaId?: number;
	public tipoFacturaGlobalId?: number;
	public tipoFacturaGlobal?: ControlMaestroMultiple;

	public mediosPagoPV?: MedioPagoPV[];
	public planteles?:SucursalPlantelEditarProjection[];
}

export class SucursalComboProjection {
	id?: number;
	nombre?: string;
	prefijo?: string;
	public codigoSucursal?: string;
	public valro?: string;
	public tipoFacturaGlobalId?: number;
}

export class SucursalListadoProjection {
	public id?: number;
    public nombre?: string;
    public responsable?: UsuarioComboProjection;
    public porcentajeComision?: number;
    public telefono?: string;
    public activo?: boolean;
}

export class SucursalComboIncompanyProjection {
	public id?: number;
	public nombre?: string;
	public prefijo?: string;
	public codigoSucursal?: string;
	public valro?: string;
	public tipoFacturaGlobalId?: number;
	public responsable?: Usuario;
	public coordinador?: Usuario;
}