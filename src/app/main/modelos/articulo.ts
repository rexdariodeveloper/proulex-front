import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection, ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { Usuario } from '@models/usuario';
import { ArticuloFamilia, ArticuloFamiliaComboProjection } from './articulo-familia';
import { ArticuloCategoria, ArticuloCategoriaComboProjection } from './articulo-categoria';
import { ArticuloSubcategoria, ArticuloSubcategoriaComboProjection } from './articulo-subcategoria';
import { ArticuloTipo, ArticuloTipoComboProjection } from './articulo-tipo';
import { ArticuloSubtipo, ArticuloSubtipoComboProjection } from './articulo-subtipo';
import { UnidadMedida, UnidadMedidaComboProjection, UnidadMedidaListadoProjection } from './unidad-medida';
import { Sucursal, SucursalComboProjection } from './sucursal';
import { ArticuloComponente, ArticuloComponenteArbolProjection, ArticuloComponenteEditarProjection } from './articulo-componente';
import { ArchivoProjection } from '@models/archivo';
import { ProgramaComboProjection } from './programa';

export class Articulo {
	public id?: number;
	public codigoArticulo?: string;
	public nombreArticulo?: string;
	public codigoBarras?: string;
	public codigoAlterno?: string;
	public nombreAlterno?: string;
	public descripcion?: string;
	public descripcionCorta?: string;
	public claveProductoSAT?: string;
	public iva?: number;
	public ivaExento?: boolean;
	public ieps?: number;
	public iepsCuotaFija?: number;
	public multiploPedido?: number;
	public permitirCambioAlmacen?: boolean;
	public maximoAlmacen?: number;
	public minimoAlmacen?: number;
	public planeacionTemporadas?: boolean;
	public articuloParaVenta?: boolean;
	public imagen?: any;
	public imagenId?: number;
	public familia?: ArticuloFamilia;
	public familiaId?: number;
	public categoria?: ArticuloCategoria;
	public categoriaId?: number;
	public subcategoria?: ArticuloSubcategoria;
	public subcategoriaId?: number;
	public clasificacion1?: ControlMaestroMultiple;
	public clasificacion1Id?: number;
	public clasificacion2?: ControlMaestroMultiple;
	public clasificacion2Id?: number;
	public clasificacion3?: ControlMaestroMultiple;
	public clasificacion3Id?: number;
	public clasificacion4?: ControlMaestroMultiple;
	public clasificacion4Id?: number;
	public clasificacion5?: ControlMaestroMultiple;
	public clasificacion5Id?: number;
	public clasificacion6?: ControlMaestroMultiple;
	public clasificacion6Id?: number;
	public tipoArticulo?: ArticuloTipo;
	public tipoArticuloId?: number;
	public articuloSubtipo?: ArticuloSubtipo;
	public articuloSubtipoId?: number;
	public unidadMedidaInventario?: UnidadMedida;
	public unidadMedidaInventarioId?: number;
	public unidadMedidaConversionVentas?: UnidadMedida;
	public unidadMedidaConversionVentasId?: number;
	public factorConversionVentas?: number;
	public unidadMedidaConversionCompras?: UnidadMedida;
	public unidadMedidaConversionComprasId?: number;
	public factorConversionCompras?: number;
	public tipoCosto?: ControlMaestroMultiple;
	public tipoCostoId?: number;
	public costoUltimo?: number;
	public costoPromedio?: number;
	public costoEstandar?: number;
	public activo?: boolean;
	public inventariable?: boolean;

	public idioma?: ControlMaestroMultiple;
	public idiomaId?: number;
	public programa?: ProgramaComboProjection;
	public programaId?: number;
	public editorial?: ControlMaestroMultiple;
	public editorialId?: number;
	public marcoCertificacion?: string;

    public pedirCantidadPV?: boolean;

	public componentes?: ArticuloComponente[];

	public fechaCreacion?: Date;
	public creadoPor?: Usuario;
	public creadoPorId?: number;
	public modificadoPor?: Usuario;
	public modificadoPorId?: number;
	public fechaModificacion?: Date;
	
	public mostrarSucursales?: Sucursal;
	public mostrarSucursalesPV?: Sucursal;
}

export class ArticuloEditarProjection {

	public id?: number;
    public codigoArticulo?: string;
    public nombreArticulo?: string;
    public codigoBarras?: string;
    public codigoAlterno?: string;
    public nombreAlterno?: string;
    public descripcion?: string;
    public descripcionCorta?: string;
    public claveProductoSAT?: string;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public multiploPedido?: number;
    public permitirCambioAlmacen?: boolean;
    public maximoAlmacen?: number;
    public minimoAlmacen?: number;
    public planeacionTemporadas?: boolean;
    public articuloParaVenta?: boolean;
    public imagen?: ArchivoProjection;
    public imagenId?: number;
    public familia?: ArticuloFamiliaComboProjection;
    public familiaId?: number;
    public categoria?: ArticuloCategoriaComboProjection;
    public categoriaId?: number;
    public subcategoria?: ArticuloSubcategoriaComboProjection;
    public subcategoriaId?: number;
    public clasificacion1?: ControlMaestroMultipleComboProjection;
    public clasificacion1Id?: number;
    public clasificacion2?: ControlMaestroMultipleComboProjection;
    public clasificacion2Id?: number;
    public clasificacion3?: ControlMaestroMultipleComboProjection;
    public clasificacion3Id?: number;
    public clasificacion4?: ControlMaestroMultipleComboProjection;
    public clasificacion4Id?: number;
    public clasificacion5?: ControlMaestroMultipleComboProjection;
    public clasificacion5Id?: number;
    public clasificacion6?: ControlMaestroMultipleComboProjection;
    public clasificacion6Id?: number;
    public tipoArticulo?: ArticuloTipoComboProjection;
    public tipoArticuloId?: number;
    public articuloSubtipo?: ArticuloSubtipoComboProjection;
    public articuloSubtipoId?: number;
    public unidadMedidaInventario?: UnidadMedidaComboProjection;
    public unidadMedidaInventarioId?: number;
    public unidadMedidaConversionVentas?: UnidadMedidaComboProjection;
    public unidadMedidaConversionVentasId?: number;
    public factorConversionVentas?: number;
    public unidadMedidaConversionCompras?: UnidadMedidaComboProjection;
    public unidadMedidaConversionComprasId?: number;
    public factorConversionCompras?: number;
    public tipoCosto?: ControlMaestroMultipleComboProjection;
    public tipoCostoId?: number;
    public costoUltimo?: number;
    public costoPromedio?: number;
    public costoEstandar?: number;
    public activo?: boolean;
    public inventariable?: boolean;
    public idioma?: ControlMaestroMultipleComboProjection;
    public programa?: ProgramaComboProjection;
    public editorial?: ControlMaestroMultipleComboProjection;
    public marcoCertificacion?: string;
    
    public pedirCantidadPV?: boolean;
    
    public fechaModificacion?: Date;

    public mostrarSucursales?: SucursalComboProjection[];
    public mostrarSucursalesPV?: SucursalComboProjection[];
    public componentes?: ArticuloComponenteEditarProjection[];

    public objetoImpuestoId?: number;
    public objetoImpuesto?: ControlMaestroMultipleComboSimpleProjection;
}

export class ArticuloComboProjection {

	id?: number;
    codigoArticulo?: string;
    nombreArticulo?: string;
    codigoAlterno?: string;
    nombreAlterno?: string;
	
	tipoArticuloId?: number;
	articuloSubtipoId?: number;

	familia?: ArticuloFamiliaComboProjection;
    categoria?: ArticuloCategoriaComboProjection;
    subcategoria?: ArticuloSubcategoriaComboProjection;
	unidadMedidaInventario?: UnidadMedidaListadoProjection;
    idiomaId?: number;
}

export class ArticuloPrecargarProjection{

	id?: number;
	codigoArticulo?: string;
	nombreArticulo?: string;
    unidadMedidaInventario?: UnidadMedidaComboProjection;
    unidadMedidaConversionCompras?: UnidadMedidaComboProjection;
    factorConversionCompras?: number;
    tipoCosto?: ControlMaestroMultipleComboProjection;
    tipoCostoId?: number;
    costoUltimo?: number;
    costoPromedio?: number;
    costoEstandar?: number;
    iva?: number;
    ivaExento?: boolean;
    ieps?: number;
	iepsCuotaFija?: number;
	
	familia?: ArticuloFamiliaComboProjection;
    categoria?: ArticuloCategoriaComboProjection;
    subcategoria?: ArticuloSubcategoriaComboProjection;
	
	tipoArticulo?: ArticuloTipoComboProjection;
	cuentaCompras?: string;

}

export class ArticuloUltimasComprasProjection {
	public id: number;
    public fecha: Date;
    public codigoOC: string;
    public precio: number;
}

export class ArticuloArbolComponentesProjection {
	id?: number;
    codigoArticulo?: string;
    nombreArticulo?: string;
    unidadMedidaInventario?: UnidadMedidaComboProjection;

    componentes?: ArticuloComponenteArbolProjection[];

	existencia?: number;
}

export class ArticuloComboListaPreciosProjection {

    public id?: number;
    public codigoArticulo?: string;
    public nombreArticulo?: string;
    public unidadMedidaInventario?: UnidadMedidaComboProjection;
    public iva?: number;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public precioVenta?: number;

}

export class ArticuloCardProjection {

    public id?: number;
    public nombre?: string;
    public imagenId?: number;
    public articuloSubtipoId?: number;
    public pedirCantidadPV?: boolean;

}

export class ArticuloListadoPrecioMaterialProjection {

    public id?: number;
    public codigoArticulo?: string;
    public nombreArticulo?: string;
    public unidadMedidaInventario?: UnidadMedidaListadoProjection;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public iepsCuotaFija?: number;
    public precio?: number;
    public esLibro?: boolean;
    public esCertificacion?: boolean;
    
    // Campos para actualizacion de precios
    public precioEditar: number;
    public precioUnitario?: number;
    public precioFinal?: number;

}

export class ArticuloComboSimpleProjection {
    public id?: number;
    public codigoArticulo?: string;
    public nombreArticulo?: string;
    public idiomaId?: number;
}