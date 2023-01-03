import { ArchivoProjection } from '@models/archivo';

export class FormaPago {
	public id?: number;
    public codigo: string;
    public nombre: string;
    public archivo?: ArchivoProjection;
    public archivoId?: number;
    public activo?: boolean;
}

export class FormaPagoComboProjection{
    public id: number;
    public codigo: string;
    public nombre: string;
    public valor: string;
}