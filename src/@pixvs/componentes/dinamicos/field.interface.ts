import { FormControl, Validators } from '@angular/forms';
import { CropperConfig } from './cropper/cropper.interface';

export interface Validator {
	name: string;
	validator: any;
	message: string;
}
export interface FieldConfig {
	campoValor?: string;
	collections?: any;
	elementsPerScroll?: number;
	formControl?: FormControl;
	fxFlex?: string;
	hidden?: Boolean;
	inputType?: string;
	list?: any[];
	mask?: any;
	multiple?: boolean;
	name?: string;
	options?: any[];
	readonly?: boolean;
	selectAll?: boolean;
	thousandSeparator?: string;
	type: string;
	validations?: Validator[];
	value?: any;
	values?: string[];
	label?: string;
	croppOptions?: CropperConfig;
	
	labelMain?: string;
	description?: string;
	verticalList?: Boolean;
	format?: Boolean;
	placeholder?: string;
	custom?: boolean;
	min?:number;
	max?:number;
	pattern?:string;
	oninput?:any;
	step?:number;
	columnas?: any[];
	isMatCard?: Boolean;
	etiquetaInicio?: string;
	etiquetaFin?: string;
	limitarPorColumna?:boolean;
	limitarPorFila?:boolean;
	customNinguna?: boolean;

	hideOnDisabled?: Boolean;

    showToolTip?:boolean;
}

export class FieldConfigUtils {

	private static Validators = Validators;
	private static FormControl = FormControl;

	static jsonConfigParse(jsonConfigString: string): FieldConfig {
		let jsonConfig: any = JSON.parse(jsonConfigString);

		if (jsonConfig.validations) {
			jsonConfig.validations = jsonConfig.validations.map(validator => {
				return FieldConfigUtils.validatorParse(validator);
			});
		}

		if (jsonConfig.formControl) {
			jsonConfig.formControl = FieldConfigUtils.formControlParse(jsonConfig.formControl);
		}

		return jsonConfig;
	}

	static validatorParse(validatorWithString: Validator): Validator {
		let validator: Validator = {
			name: validatorWithString.name,
			validator: this.stringToValidator(validatorWithString.validator),
			message: validatorWithString.message
		};

		return validator;
	}

	static stringToValidator(validatorString: string): any {
		let validator: any;
		eval('validator = this.' + validatorString);
		return validator;
	}

	static formControlParse(formControlString: string): FormControl {
		let formControl: FormControl;
		let FormControl = this.FormControl;
		let Validators = this.Validators;
		eval('formControl = ' + formControlString);

		return formControl;
	}
}