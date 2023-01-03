export class Redondeos {

	static DECIMALES_GENERAL: number = 6;
	static DECIMALES_DINERO: number = 2;

	/**
	 *
	 * @param cantidad Cantidad a redondear
	 * @param decimales numero de decimales
	 */
	static redondear(cantidad: number = 0, decimales: number = Redondeos.DECIMALES_GENERAL): number {
		return Number(Math.round(parseFloat(cantidad + 'e' + decimales)) + 'e-' + decimales);
	}

}