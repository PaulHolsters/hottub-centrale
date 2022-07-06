import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DataService} from "../services/data.service";
import {ProductStorageService} from "../services/product.storage.service";
import {MessageService} from "primeng/api";
import {BreadcrumbStorageService} from "../services/breadcrumb.storage.service";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  providers: [DataService]
})
export class ProductsComponent implements OnInit, AfterViewChecked {

  constructor(private messageService:MessageService,
              private router: Router,
              private dataService:DataService,
              private storage:ProductStorageService,
              private breadcrumbStorage:BreadcrumbStorageService,
              private cd: ChangeDetectorRef) {

  }

  ngOnInit(): void {
      this.breadcrumbStorage.routeChange.emit([{label:'Producten'}])
  }

  products(){
    this.router.navigate(['/producten/overzicht'])
  }

  newProduct(){
    this.router.navigate(['/producten/nieuw'])
  }

  ngAfterViewChecked(): void {
    if(this.storage.hasMessage()){
      this.messageService.add({key:'successMsg', severity:'success', summary: this.storage.getMessage()})
      this.storage.resetMessage()
      this.cd.detectChanges()
    }
  }

}
