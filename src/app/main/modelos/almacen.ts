import { Sucursal, SucursalComboProjection } from './sucursal';
import { Usuario } from '@models/usuario';
import { Pais, PaisComboProjection } from './pais';
import { Estado, EstadoComboProjection } from './estado';
import { Localidad, LocalidadListadoProjection } from './localidad';
import { Cliente } from './cliente';

export class Almacen {
	public id?: number;
    public codigoAlmacen?: string;
    public nombre?: string;
    public sucursal?: Sucursal;
    public sucursalId?: number;
    public responsable?: Usuario;
    public responsableId?: number;
    public mismaDireccionSucursal?: boolean;
    public mismaDireccionCliente?: boolean;
    public domicilio?: string;
    public colonia?: string;
    public pais?: Pais;
    public paisId?: number;
    public estado?: Estado;
    public estadoId?: number;
    public ciudad?: string;
    public cp?: string;
    public telefono?: string;
    public extension?: string;
    public predeterminado?: boolean;
    public esCedi?: boolean;
    public localidadesBandera?: boolean;
    public activo?: boolean;
    public cliente?: Cliente;
    public clienteId?: number;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaModificacion?: Date;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public localidades?: Localidad[];
}

export class AlmacenComboProjection {
	id?: number;
	codigoAlmacen?: string;
	nombre?: string;
	esCedi?: boolean;
	sucursal?: SucursalComboProjection;
}

export class AlmacenComboDomicilioProjection {
	id?: number;
	codigoAlmacen?: string;
	nombre?: string;
	esCedi?: boolean;
	sucursal?: SucursalComboProjection;
	domicilio: string;
    colonia: string;
    cp: string;
    ciudad: string;
    estado: EstadoComboProjection;
	pais: PaisComboProjection;
	direccionCompleta: string;
}