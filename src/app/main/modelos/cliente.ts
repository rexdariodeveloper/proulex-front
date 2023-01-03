import { Almacen } from './almacen';
import { ClienteContacto } from './cliente-contacto';
import { ClienteCuentaBancaria } from './cliente-cuenta-bancaria';
import { Estado } from './estado';
import { FormaPago } from './FormaPago';
import { Moneda } from './moneda';
import { Pais } from './pais';
import { ListadoPrecio } from './listado-precio';
import { ClienteDatosFacturacion } from './cliente-datos-facturacion';

export class Cliente {
	
	public id?: number;
	public codigo?: string;
	public nombre?: string;
	public rfc?: string;
	public razonSocial?: string;
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
	public correoElectronico?: string;
	public paginaWeb?: string;
	public formaPagoId?: number;
	public formaPago?: FormaPago;
	public comentarios?: string;
	public monedaId?: number;
	public moneda?: Moneda;
	public cuentaCXC?: string;
	public montoCredito?: string;
	public diasCobro?: string;
	public listadoPrecio?: ListadoPrecio;
	public listadoPrecioId?: number;
	public activo?: boolean;
	public consignacion?: boolean;
	public fechaCreacion?: Date;
	public fechaModificacion?: Date;
	public creadoPorId?: number;
	public modificadoPorId?: number;
	public contactos?: ClienteContacto[];
	public cuentasBancarias?: ClienteCuentaBancaria[];
	public almacenesConsignacion?: Almacen[];
	public facturacion?: ClienteDatosFacturacion[];

	public constructor() {
		this.facturacion = [];
	}
}

export class ClienteComboProjection{
	public id?: number;
	public nombre?: string;
}

export class ClienteDatosFacturarProjection {

	id?: number;
    codigo?: String;
    nombre?: String;
    rfc?: String;
    razonSocial?: String;
    direccion?: String;
    ciudadOrigen?: String;

}

export class ClienteCardProjection{
	public id?: number;
	public nombre?: string;
}