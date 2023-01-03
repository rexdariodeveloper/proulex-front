import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import Calendar from "js-year-calendar";
import CalendarDataSourceElement from "js-year-calendar/dist/interfaces/CalendarDataSourceElement";
import CalendarOptions from "js-year-calendar/dist/interfaces/CalendarOptions";
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export enum TiposTelefono {
    Casa,
    Movil,
    Trabajo,
    Whatsapp
}

@Component({
	selector: 'pixvs-phone-picker',
	templateUrl: './phone-picker.component.html',
	styleUrls: ['./phone-picker.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsPhonePickerComponent implements OnInit {

	// @Inputs
	@Input() telefonoCasaControl: FormControl = null;
	@Input() telefonoMovilControl: FormControl = null;
	@Input() telefonoTrabajoControl: FormControl = null;
	@Input() telefonoTrabajoExtensionControl: FormControl = null;
	@Input() telefonoWhatsappControl: FormControl = null;
    @Input() minimoNumeros: number = 1;
    @Input() maximoNumeros: number = 4;
    @Input() limpiarCamposBS: BehaviorSubject<boolean> = new BehaviorSubject(false);
    @Input() deshabilitarBoton: Boolean = true;

	// public
    TiposTelefono = TiposTelefono;
	tiposSeleccionados: TiposTelefono[];
    telefonoControls: FormControl[] = [];

	private _unsubscribeAll: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		public dialog: MatDialog,
		private translate: TranslateService,
		private hashid: HashidsService,
		private router: Router
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
        if(!!this.telefonoCasaControl?.value || !!this.telefonoMovilControl?.value || !!this.telefonoTrabajoControl?.value || !!this.telefonoWhatsappControl?.value){
            this.tiposSeleccionados = [];
            this.telefonoControls = [];
            if(!!this.telefonoCasaControl?.value){
                this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Casa]);
                this.telefonoControls = this.telefonoControls.concat([this.telefonoCasaControl]);
            }
            if(!!this.telefonoMovilControl?.value){
                this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Movil]);
                this.telefonoControls = this.telefonoControls.concat([this.telefonoMovilControl]);
            }
            if(!!this.telefonoTrabajoControl?.value){
                this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Trabajo]);
                this.telefonoControls = this.telefonoControls.concat([this.telefonoTrabajoControl]);
            }
            if(!!this.telefonoWhatsappControl?.value){
                this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Whatsapp]);
                this.telefonoControls = this.telefonoControls.concat([this.telefonoWhatsappControl]);
            }
        }else if(!!this.telefonoCasaControl){
            this.tiposSeleccionados = [TiposTelefono.Casa];
            this.telefonoControls = [this.telefonoCasaControl];
        }else if(!!this.telefonoMovilControl){
            this.tiposSeleccionados = [TiposTelefono.Movil];
            this.telefonoControls = [this.telefonoMovilControl];
        }else if(!!this.telefonoTrabajoControl){
            this.tiposSeleccionados = [TiposTelefono.Trabajo];
            this.telefonoControls = [this.telefonoTrabajoControl];
        }else if(!!this.telefonoWhatsappControl){
            this.tiposSeleccionados = [TiposTelefono.Whatsapp];
            this.telefonoControls = [this.telefonoWhatsappControl];
        }

        // this.limpiarCamposBS.pipe(takeUntil(this._unsubscribeAll)).subscribe(limpiar => {
        // })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.telefonoCasaControl){
            this.telefonoCasaControl = changes.telefonoCasaControl.currentValue;
        }
        if(changes.telefonoMovilControl){
            this.telefonoMovilControl = changes.telefonoMovilControl.currentValue;
        }
        if(changes.telefonoTrabajoControl){
            this.telefonoTrabajoControl = changes.telefonoTrabajoControl.currentValue;
        }
        if(changes.telefonoTrabajoExtensionControl){
            this.telefonoTrabajoExtensionControl = changes.telefonoTrabajoExtensionControl.currentValue;
        }
        if(changes.telefonoWhatsappControl){
            this.telefonoWhatsappControl = changes.telefonoWhatsappControl.currentValue;
        }
        if(changes.minimoNumeros){
            this.minimoNumeros = changes.minimoNumeros.currentValue;
        }
        if(changes.maximoNumeros){
            this.maximoNumeros = changes.maximoNumeros.currentValue;
        }
        if(changes.limpiarCamposBS){
            this.limpiarCamposBS = changes.limpiarCamposBS.currentValue;
        }
        if(changes.deshabilitarBoton){
            this.deshabilitarBoton = changes.deshabilitarBoton.currentValue;
        }
    }

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

    seleccionarTipo(tipo: TiposTelefono, i: number){
        if(this.tiposSeleccionados[i] != tipo){
            if(this.tiposSeleccionados[i] == TiposTelefono.Trabajo){
                this.telefonoTrabajoExtensionControl.setValue(null);
            }
            this.tiposSeleccionados[i] = tipo;
            this.telefonoControls[i].setValue(null);
            switch(tipo){
                case TiposTelefono.Casa:
                    this.telefonoControls[i] = this.telefonoCasaControl;
                    break;
                case TiposTelefono.Movil:
                    this.telefonoControls[i] = this.telefonoMovilControl;
                    break;
                case TiposTelefono.Trabajo:
                    this.telefonoControls[i] = this.telefonoTrabajoControl;
                    break;
                case TiposTelefono.Whatsapp:
                    this.telefonoControls[i] = this.telefonoWhatsappControl;
                    break;
            }
        }
    }

    onNuevoTelefono(){
        if(!!this.telefonoCasaControl && !this.tiposSeleccionados.includes(TiposTelefono.Casa)){
            this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Casa]);
            this.telefonoControls = this.telefonoControls.concat([this.telefonoCasaControl]);
        }else if(!!this.telefonoMovilControl && !this.tiposSeleccionados.includes(TiposTelefono.Movil)){
            this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Movil]);
            this.telefonoControls = this.telefonoControls.concat([this.telefonoMovilControl]);
        }else if(!!this.telefonoTrabajoControl && !this.tiposSeleccionados.includes(TiposTelefono.Trabajo)){
            this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Trabajo]);
            this.telefonoControls = this.telefonoControls.concat([this.telefonoTrabajoControl]);
        }else if(!!this.telefonoWhatsappControl && !this.tiposSeleccionados.includes(TiposTelefono.Whatsapp)){
            this.tiposSeleccionados = this.tiposSeleccionados.concat([TiposTelefono.Whatsapp]);
            this.telefonoControls = this.telefonoControls.concat([this.telefonoWhatsappControl]);
        }
    }

    eliminarNumero(index: number){
        for(let i=index ; i<this.telefonoControls.length ; i++){
            this.tiposSeleccionados[i] = this.tiposSeleccionados[i+1];
            this.telefonoControls[i] = this.telefonoControls[i+1];
        }
        this.tiposSeleccionados = this.tiposSeleccionados.slice(0,this.tiposSeleccionados.length-1);
        this.telefonoControls = this.telefonoControls.slice(0,this.telefonoControls.length-1);
    }

}