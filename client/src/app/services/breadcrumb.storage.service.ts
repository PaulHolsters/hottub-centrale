import {EventEmitter, Injectable} from "@angular/core";
import {MenuItem} from "primeng/api";

@Injectable()
export class BreadcrumbStorageService{
    routeChange = new EventEmitter<MenuItem[]>()

}