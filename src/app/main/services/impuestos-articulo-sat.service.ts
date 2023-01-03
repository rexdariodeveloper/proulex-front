import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })

export class ImpuestosArticuloSATService {

    private decimales = 6;
    private subtotal: number;
    private iva: number;
    private ieps: number;
    private descuento: number;
    private total: number

    constructor() { }

    /**
     * 
     * @param cantidad Cantidad de articulos
     * @param precioUnitario Precico unitaio del articulo sin impuesto
     * @param descuento Monto del descuento(no es porcentaje)
     * @param iva Porcentaje del IVA, por lo tanto se divide entre 100
     * @param ieps Porcentaje del IEPS, por lo tanto se divide entre 100
     * @param cuotaFija Cuota fija, monto de la cuota fija
     */
    getMontos(cantidad: number, precioUnitario: number, descuento: number, iva: number, ieps: number, cuotaFija: number, decimales: number = 6): any {

        const CantidadLimpia = (cantidad || 0);
        const PrecioUnitarioLimpio = (precioUnitario || 0);
        const DescuentoLimpio = (descuento || 0);
        const IEPSLimpio = (ieps || 0) / 100;
        const IVALimpio = (iva || 0) / 100;
        this.decimales = decimales;

        this.subtotal = this.redondear(CantidadLimpia * PrecioUnitarioLimpio, this.decimales);

        const base = this.redondear(this.subtotal - DescuentoLimpio, this.decimales);

        if (!!!cuotaFija) {
            this.ieps = this.redondear(base * IEPSLimpio, this.decimales);
        } else {
            this.ieps = this.redondear(CantidadLimpia * cuotaFija, this.decimales);
        }

        this.iva = this.redondear(base * IVALimpio, this.decimales);
        this.descuento = this.redondear(DescuentoLimpio, this.decimales);
        this.total = this.redondear((base + this.iva + this.ieps), this.decimales);

        const valores = {
            subtotal: this.subtotal,
            iva: this.iva,
            ieps: this.ieps,
            descuento: this.descuento,
            total: this.total
        };

        return valores;
    }

    /**
     * 
     * @param cantidad Cantidad a redondear
     * @param decimales numero de decimales
     */
    private redondear(cantidad: number = 0, decimales: number = 6): number {
        return Number(Math.round(parseFloat(cantidad + 'e' + decimales)) + 'e-' + decimales);
    }
}