import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { ProveedorComboProjection, Proveedor } from './proveedor';
import { Almacen, AlmacenComboProjection } from './almacen';
import { Moneda, MonedaComboProjection } from './moneda';
import { Departamento, DepartamentoComboProjection } from '../../../@pixvs/models/departamento';
import { OrdenCompraDetalle, OrdenCompraDetalleDevolverProjection, OrdenCompraDetalleEditarProjection, OrdenCompraDetalleRecibirProjection } from './orden-compra-detalle';
import { ArchivoProjection } from '@models/archivo';

export class OrdenCompra {
	public id: number;
	public codigo: string;
	public proveedor: Proveedor;
	public proveedorId: number;
	public fechaOC: Date;
	public fechaRequerida: Date;
	public direccionOC?: string;
	public remitirA?: string;
	public recepcionArticulosAlmacen: Almacen;
	public recepcionArticulosAlmacenId: number;
	public moneda: Moneda;
	public monedaId: number;
	public terminoPago: number;
	public departamento: Departamento;
	public departamentoId: number;
	public descuento?: number;
	public comentario?: string;
	public estatus: ControlMaestroMultiple;
	public estatusId: number;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
	public fechaCreacion?: Date;
	
	public detalles?: OrdenCompraDetalle[];

}

export class OrdenCompraListadoProjection {

	public id?: number;
    public codigo?: string;
    public proveedor?: ProveedorComboProjection;
    public proveedorId?: number;
    public sedeNombre?:string;
    public fechaOc?: Date;
    public fechaModificacion?: Date;
    public estatus?: ControlMaestroMultipleComboProjection;
	public estatusId?: number;
	
	public evidencia: ArchivoProjection[];
	public facturas: ArchivoProjection[];

}

export class OrdenCompraEditarProjection {

	id?: number;
    codigo?: string;
    proveedor?: ProveedorComboProjection;
    proveedorId?: number;
    fechaOC?: Date;
    fechaRequerida?: Date;
    direccionOC?: string;
    remitirA?: string;
    recepcionArticulosAlmacen?: AlmacenComboProjection;
    recepcionArticulosAlmacenId?: number;
    moneda?: MonedaComboProjection;
    monedaId?: number;
    terminoPago?: number;
    departamento?: DepartamentoComboProjection;
    departamentoId?: number;
    descuento?: number;
    comentario?: string;
    estatus?: ControlMaestroMultipleComboProjection;
    estatusId?: number;
    creadoPor?: UsuarioComboProjection;
    autorizadoPor?: UsuarioComboProjection;
    fechaModificacion?: Date;
    detalles?: OrdenCompraDetalleEditarProjection[];

}

export class OrdenCompraRecibirProjection {

	id?: number;
	codigo?: string;
    proveedor?: ProveedorComboProjection;
    fechaRequerida?: Date;
    fechaModificacion?: Date;
    detalles?: OrdenCompraDetalleRecibirProjection[];

}

export class OrdenCompraDevolverProjection {

	id?: number;
    codigo?: string;
    proveedor?: ProveedorComboProjection;
    fechaRequerida?: Date;
    fechaModificacion?: Date;

    detalles?: OrdenCompraDetalleDevolverProjection[];

}

export class OrdenCompraRelacionarProjection{

	id: number;
    codigo: string;
    fechaOC: Date;
    montoOC: number;
    montoPendienteRelacionar: number;

}

export class OrdenCompraCargarReciboProjection{

	id: number;
	proveedor: ProveedorComboProjection;

}