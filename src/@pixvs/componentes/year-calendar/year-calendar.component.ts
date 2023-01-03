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
import { Subject } from "rxjs";

@Component({
	selector: 'pixvs-year-calendar',
	templateUrl: './year-calendar.component.html',
	styleUrls: ['./year-calendar.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsYearCalendarComponent implements OnInit {

	@Input() id: number;
    @Input() fechaInicio: Date = null;
    @Input() fechaFin: Date = null;
	@Input() datasource: CalendarDataSourceElement[] = [];

	@Output() onClickDia: EventEmitter<CalendarDataSourceElement[]> = new EventEmitter();

	private _unsubscribeAll: Subject<any>;

	private calendario: Calendar<CalendarDataSourceElement>;

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
		this.initCalendario();
	}

    ngOnChanges(changes: SimpleChanges): void {
		if(changes.fechaInicio){
			this.fechaInicio = changes.fechaInicio.currentValue;
			if(!!this.calendario){
				this.calendario.setMinDate(this.fechaInicio);
				if(!!this.fechaInicio && this.calendario.getYear() < this.fechaInicio.getFullYear()){
					this.calendario.setYear(this.fechaInicio.getFullYear());
				}
			}
		}
		if(changes.fechaFin){
			this.fechaFin = changes.fechaFin.currentValue;
			if(!!this.calendario){
				this.calendario.setMaxDate(this.fechaFin);
				if(!!this.fechaFin && this.calendario.getYear() > this.fechaFin.getFullYear()){
					this.calendario.setYear(this.fechaFin.getFullYear());
				}
			}
		}
		if(changes.datasource){
			this.datasource = changes.datasource.currentValue;
			if(!!this.calendario){
				this.calendario.setDataSource(this.datasource);
			}
		}
    }

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	initCalendario(){
		let elem = document.querySelector('.calendar-' + this.id);
		if(elem){
			let calendarOpts: CalendarOptions<CalendarDataSourceElement> = {
                loadingTemplate: '.calendar-' + this.id,
                minDate: this.fechaInicio,
                maxDate: this.fechaFin,
				dataSource: this.datasource,
				clickDay: this.clickDia.bind(this)
            };
            this.calendario = new Calendar('.calendar-' + this.id,calendarOpts);
			if(!!this.fechaInicio && this.calendario.getYear() < this.fechaInicio.getFullYear()){
				this.calendario.setYear(this.fechaInicio.getFullYear());
			}
			if(!!this.fechaFin && this.calendario.getYear() > this.fechaFin.getFullYear()){
				this.calendario.setYear(this.fechaFin.getFullYear());
			}
		}else{
			setTimeout(() => {
				this.initCalendario();
			}, 100);
		}
	}

	clickDia(event){
		this.onClickDia.emit(event.events);
	}

}