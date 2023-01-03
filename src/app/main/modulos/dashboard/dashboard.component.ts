import { ChangeDetectorRef, Component } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';

import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { DashboardService } from './dashboard.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

export interface NgxDataSet {
    label: string;
    data: number[];
    fill?: string | boolean;
}

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: fuseAnimations
})
export class DashboardComponent {
    //Labels
    //Years labels
    yLabels: string[] = [];
    //Months labels
    mLabels: string[] = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    //Columns
    displayedColumns: string[] = ['cantidad','descripcion','monto'];
    
    //Selected dataset (global)
    selected: string = '2020';
    
    //Datasets
    //Banner datasets
    bDatasets: any = {};
    //Stacked Horizontal dataset
    sbhDataset: any;
    //Pie Chart dataset
    pcDataset: any;
    //Table dataset
    tDataset: any;
    //Tree map dataset
    tmDataset: any;

    //forms
    sedesForm: FormGroup = null;
    horariosForm: FormGroup = null;
    descuentosForm: FormGroup = null;
    programasForm: FormGroup = null;
    
    //Charts size
    size: any[] = [700 , 500];

    meses = [
        { id: '01', label: 'Enero'}, { id: '02', label: 'Febrero'}, { id: '03', label: 'Marzo'},
        { id: '04', label: 'Abril'}, { id: '05', label: 'Mayo'}, { id: '06', label: 'Junio'},
        { id: '07', label: 'Julio'}, { id: '08', label: 'Agosto'}, { id: '09', label: 'Septiembre'},
        { id: '10', label: 'Octubre'}, { id: '11', label: 'Noviembre'}, { id: '12', label: 'Diciembre'},
    ];
    sedes = [];

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private changeDetector: ChangeDetectorRef,
        private dashboardService: DashboardService,
        private _formBuilder: FormBuilder
    ) {
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this.sedesForm      = this.createForm();
        this.horariosForm   = this.createForm();
        this.descuentosForm = this.createForm();
        this.programasForm  = this.createForm();

        this.sedesForm.get('month').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.sedesForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getTreeMapData(toSend);
            }    
        });

        this.sedesForm.get('sedes').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.sedesForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getTreeMapData(toSend);
            }    
        });

        this.horariosForm.get('month').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.horariosForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getHorizontalBarData(toSend);
            }
        });

        this.horariosForm.get('sedes').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.horariosForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getHorizontalBarData(toSend);
            }    
        });

        this.descuentosForm.get('month').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.descuentosForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getTableData(toSend);
            }
        });

        this.descuentosForm.get('sedes').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.descuentosForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getTableData(toSend);
            }    
        });

        this.programasForm.get('month').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.programasForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getPieChartData(toSend);
            }
        });

        this.programasForm.get('sedes').valueChanges.subscribe((data) => {
            if(!!data){
                let d = this.programasForm.getRawValue();
                let toSend = {year: this.selected, month: d.month, sedes: d.sedes};
                this.dashboardService.getPieChartData(toSend);
            }    
        });
    }

    loaded: boolean = false;
    ngAfterViewChecked() {
        this.changeDetector.detectChanges();
    }

    ngOnInit(): void {
        
        this.dashboardService.onDatosChanged.subscribe((response) => {
            if(response?.datos){
                this.yLabels = this.getKeys(response.datos, 'anio');
                this.bDatasets = this.fillBannerDataset(response.datos, 'Ingresos');
                this.loaded = true;
                this.selected = this.yLabels[this.yLabels.length - 1];
                console.log(this.bDatasets);
            }
            if(response?.sedes){
                this.sedes = response.sedes;
            }
        });

        this.dashboardService.onHorizontalBarChanged.subscribe((response) => {
            if(response?.datos){
                this.sbhDataset = this.fillHStackedDataset(response.datos);
            }
        });

        this.dashboardService.onPieChartChanged.subscribe((response) => {
            if(response?.datos){
                this.pcDataset = response.datos;
            }
        });

        this.dashboardService.onTableChanged.subscribe((response) => {
            if(response?.datos)
                this.tDataset = response.datos;
        });
        
        this.dashboardService.onTreeMapChanged.subscribe((response) => {
            if(response?.datos)
                this.tmDataset = this.fillTreemapDataset(response?.datos, 'tipoSucursal');
        });
    }

    ngAfterViewInit(): void {
        this.getSize();
    }

    createForm(): FormGroup {
        let form = this._formBuilder.group({
            month: new FormControl(null,[]),
            sedes: new FormControl(null,[])
        });

        return form;
    }

    getKeys(array, key) {
        let d = array.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
        return Object.keys(d);
    }

    onResize(ev){
        this.getSize();
    }

    getSize() {
        let width = document.getElementById('treeMapChart').clientWidth;
        this.size[0] = width;
    }

    onSelected(option){
        this.dashboardService.getHorizontalBarData({year: option, month: null, sedes: null});
        this.dashboardService.getPieChartData({year: option, month: null, sedes: null});
        this.dashboardService.getTableData({year: option, month: null, sedes: null});
        this.dashboardService.getTreeMapData({year: option, month: null, sedes: null});
    }

    private fillBannerDataset(data,label){
        let yLabels = [];
        let mLabels = this.mLabels;
        let datasets = {};
        data.forEach((row) => {
            let index = yLabels.indexOf(row['anio']);
            if(index == -1){
                yLabels.push(row['anio']);
                datasets[row['anio']] = [];
                let dataset: NgxDataSet = {label:label,data:[0,0,0,0,0,0,0,0,0,0,0,0],fill:'start'};
                datasets[row['anio']].push(dataset);
            }
            //let i = mLabels.indexOf(row['mes'])
            let i = Number(row['mes']) - 1;
            datasets[row['anio']][0].data[i] += row.value;
        });
        this.yLabels = yLabels.reverse();
        console.log(datasets);
        return datasets;
    }

    private fillHStackedDataset(data){
        let hLabels = ['01','02','03','04','05','06','07','08','18','20'];
        let horarios = [
            '07:00-09:00',
            '09:00-11:00',
            '11:00-13:00',
            '13:00-15:00',
            '15:00-17:00',
            '17:00-19:00',
            '19:00-21:00',
            '09:00-14:00',
            '08:00-09:30',
            '10:00-12:00'
        ];
        let tLabels = this.getKeys(data,'idioma');
        let dataset = [];

        hLabels.forEach((hlabel, i) => {
            tLabels.forEach((tlabel) => {
                let datos = data.filter((d) => {return d.horario == hlabel && d.idioma == tlabel});
                let suma = 0;
                datos.forEach((d) => { suma += d.value; });

                dataset.push({horario: horarios[i], idioma: tlabel, valor: suma});
            });
        });

        return dataset;
    }

    private fillTreemapDataset(data, group: string) {
        if(!data.length)
            return [];
        let primaryGroup = this.getKeys(data, group);
        let groupedData = [];

        primaryGroup.forEach((tipo) => {
            let dpt = data.filter((d) => d.tipoSucursal == tipo);
            let o = {value: 0, name: tipo, children: []};
            o.children = dpt.map((d) => {
                o.value += d.value;
                return {value: d.value, name: d.nombreSucursal};
            });
            groupedData.push(o);
        });
        return groupedData;
    }
}
