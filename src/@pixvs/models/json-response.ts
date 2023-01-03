export class JsonResponse {
	public status?: number;
	public message?: string;
	public data?: any;
	public title?: string;

	constructor(status: number, message: string, data: any, title: string) {
		this.status = status;
		this.message = message;
		this.data = data;
		this.title = title;
	}
}

export class JsonResponseError {
	public status?: number;
	public message?: string;
	public path?: string;
	public error?: string;
}
