import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
    selector: 'footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    year: number = 2020
    noRequireLogin: boolean = environment.noRequiredLogin;
    /**
     * Constructor
     */
    constructor() {
        this.year = new Date().getFullYear();
    }
}
