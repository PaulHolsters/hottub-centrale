import {Injectable} from "@angular/core";
import {DataService} from "./data.service"

@Injectable()
export class InvoiceStorageService{
    message:string|undefined
    constructor(private dataService: DataService) {

    }

    setMessage(msg:string){
        this.message = msg
    }

    resetMessage(){
        this.message = undefined
    }

    hasMessage(){
        return this.message!==undefined
    }

    getMessage(){
        return this.message
    }
}
