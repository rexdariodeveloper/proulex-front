import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from "@angular/core";
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as english } from '../../i18n/en';
import { locale as spanish } from '../../i18n/es';
import { Subject } from 'rxjs';
// import { _MenuListadoGeneralModulo } from '../../menu-listados-generales.models';
import { HashidsService } from '@services/hashids.service';
import { MenuListadoGeneral } from '@models/menu-listado-general';

@Component({
	selector: 'modulos-sidebar',
    templateUrl: './modulos-sidebar.component.html',
    styleUrls: ['./modulos-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModulosSidebarComponent implements OnInit, OnDestroy, OnChanges {

	@Input() menu: MenuListadoGeneral[] = [];

	textoBuscar: string = '';

	// Private
    private _unsubscribeAll: Subject<any>;

	constructor(
		private _snackBar: MatSnackBar,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private hashid: HashidsService
	){
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
        this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.menu){
			this.menu = changes.menu.currentValue || [];
		}
	}

	getHashId(id: number) {
        return this.hashid.encode(id)
    }

}