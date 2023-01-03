import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { FormaPagoComboProjection } from './FormaPago';
import { MonedaComboProjection } from './moneda';

export class ProveedorFormaPago {
	public id: number;
	public activo: boolean;
	public proveedorId: number;
	public formaPagoId: number;
	public monedaId: number;
	public banco?: string;
	public referencia?: string;
	public numeroCuenta?: string;
	public cuentaClabe?: string;
	public bicSwift?: string;
	public iban?: string;
	public nombreTitularTarjeta?: string;
	public predeterminado: boolean;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public fechaCreacion?: Date;

}

export class ProveedorFormaPagoEditarProjection {

	id?: number;
    activo?: boolean;
    proveedorId?: number;
    formaPago?: FormaPagoComboProjection;
    moneda?: MonedaComboProjection;
    banco?: string;
    referencia?: string;
    numeroCuenta?: string;
    cuentaClabe?: string;
    bicSwift?: string;
	iban?: string;
	nombreTitularTarjeta?: string;
    predeterminado?: boolean;
    fechaModificacion?: Date;

}