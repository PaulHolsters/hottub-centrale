import { Component, OnInit } from '@angular/core';
import {QuotationModel} from "../../models/quotation/quotation.model";
import {DataService} from "../../services/data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductModel} from "../../models/product/product.model";
import {OptionModel} from "../../models/product/option.model";
import {BreadcrumbStorageService} from "../../services/breadcrumb.storage.service";
import {SharedFunctionService} from "../../services/shared-functions.service";

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styleUrls: ['./quotation-detail.component.css']
})
export class QuotationDetailComponent implements OnInit {
  quotation:QuotationModel
  selectedOptions:OptionModel[]|undefined
  constructor(private dataService:DataService,private route:ActivatedRoute,private router:Router,
              private breadcrumbStorage:BreadcrumbStorageService,
              private shfs:SharedFunctionService) {
    this.quotation = new QuotationModel(1, undefined, [], [], {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
          phoneNumber: undefined,
          street: undefined,
          houseNumber: undefined,
          postalCode: undefined,
          city: undefined,
          country: undefined
    },
       21, 0, undefined,undefined,undefined,undefined,undefined,undefined,undefined)
    this.dataService.getQuotation(this.route.snapshot.params['id']).subscribe(res=>{
      const product = new ProductModel(res.quotationValues.productName,res.quotationValues.productCat,res.quotationValues.productPrice,
          res.quotationValues.productSpecifications,res.quotationValues.optionValues,res.productId)
      this.quotation = new QuotationModel(res.version,product,res.selectedOptions,res.quotationValues.quotationSpecificationValues,
          res.customerInfo,res.VAT,res.discount,res.sendDate,res.sendDateStr,res.creationDate,res.creationDateStr,res.address,res.deposit,res._id)
      this.dataService.getOptions().subscribe(options=>{
        this.selectedOptions = options.filter(opt=>{
          return this.quotation.options.includes(opt._id||'')
        })
      })
    })
  }

  ngOnInit(): void {
    this.breadcrumbStorage.routeChange.emit([
      {label:'Home', routerLink:'/'},
      {label:'Offertes',routerLink:'offertes'},
      {label:'Detail offerte'}
    ])
  }

  totalPrice(options:boolean,vat:boolean):number{
    if(options && vat){
      let optionsPrice = 0
      if(this.selectedOptions){
        optionsPrice = this.selectedOptions.map(opt=>opt.price||0).reduce((x,y)=>( x + y),0)
      }
      return ((this.quotation.product?.price || 0) + optionsPrice) + ((this.quotation.product?.price || 0) + optionsPrice)
          * (this.quotation.VAT/100)
    } else if(vat){
      return ((this.quotation.product?.price || 0)) + ((this.quotation.product?.price || 0))
          * (this.quotation.VAT/100)
    } else if(options){
      let optionsPrice = 0
      if(this.selectedOptions){
        optionsPrice = this.selectedOptions.map(opt=>opt.price||0).reduce((x,y)=>(x+y),0)
      }
      return ((this.quotation.product?.price || 0) + optionsPrice)
    } else{
      return (this.quotation.product?.price || 0)
    }
  }

  previous(){
    this.router.navigate(['offertes/overzicht'])
  }

}
