import { Component, ViewEncapsulation } from '@angular/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '@services/login.service';
import { JsonResponse } from '@models/json-response';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'mail-confirm',
    templateUrl  : './mail-confirm.component.html',
    styleUrls    : ['./mail-confirm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class MailConfirmComponent
{   
    isConfirmed: boolean = false;
    constructor(
        private _fuseConfigService: FuseConfigService,
        private route: ActivatedRoute,
        private _service: LoginService,
        private _matSnackBar: MatSnackBar
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    ngOnInit(): void {
        let userId = this.route.snapshot.queryParamMap.get('userId');
        this.isConfirmed = !!userId;
        if(this.isConfirmed){
            this.confirmEmail(userId);
        }
    }

    confirmEmail(userId) {
        this._service.verificarCorreo(userId).subscribe((response: JsonResponse) => {
            if (response.status == 200) {
                this._matSnackBar.open('Correo electrónico confirmado', 'OK', {
                    duration: 5000,
                });
            }
        })
    }
}
