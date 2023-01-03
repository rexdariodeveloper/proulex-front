import { AlmacenComboProjection } from './almacen';
import { DepartamentoComboProjection } from '../../../@pixvs/models/departamento';

export class UsuarioDatosAdicionalesProjection {
	id?: number;
	almacenes?: AlmacenComboProjection[];
	departamentosPermisos?: DepartamentoComboProjection[];
}