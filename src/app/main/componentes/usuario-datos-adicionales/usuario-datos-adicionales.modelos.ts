import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { PixvsMatTreeNodo } from '@models/pixvs-mat-tree';

export class SucursalComboArbol extends PixvsMatTreeNodo<SucursalComboProjection,any> {
	almacenes: PixvsMatTreeNodo<AlmacenComboProjection,any>[];
}

// export class AlmacenComboNodo extends AlmacenComboProjection {
// 	info: AlmacenComboProjection;
// 	ocultarAcciones: boolean;
// 	selected: boolean;
// }