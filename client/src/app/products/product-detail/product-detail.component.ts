import { Component, OnInit } from '@angular/core';
import {ProductModel} from "../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../services/data.service";
import {BreadcrumbStorageService} from "../../services/breadcrumb.storage.service";

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product:ProductModel
  id:string|undefined
  constructor(private route:ActivatedRoute,private dataService:DataService,
              private router:Router,
              private breadcrumbStorage:BreadcrumbStorageService) {
    this.product = new ProductModel(undefined, 'hottub', undefined, [], [])
    this.dataService.getProduct(this.route.snapshot.params['id']).subscribe(product=>{
      this.product = {...product}
    })
  }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([
      {label:'Home', routerLink:'/'},
      {label:'Producten',routerLink:'producten'},
      {label:'Detail product'}
    ])
  }

  previous(){
    this.router.navigate(['producten/overzicht'])
  }

}
