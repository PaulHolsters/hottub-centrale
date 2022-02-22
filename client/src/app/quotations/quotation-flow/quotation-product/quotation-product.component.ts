import { Component, OnInit } from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {Router} from "@angular/router";
import {ProductModel} from "../../../models/product/product.model";
import {DataService} from "../../../services/data.service";
import {QuotationSpecificationModel} from "../../../models/quotation/quotation-specification.model";

@Component({
  selector: 'app-quotation-product',
  templateUrl: './quotation-product.component.html',
  styleUrls: ['./quotation-product.component.css']
})
export class QuotationProductComponent implements OnInit {
  quotation: QuotationModel
  products:ProductModel[]
  disabled: boolean
  nextClicked: boolean
  previousClicked: boolean
  constructor(private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
    this.previousClicked = false
    this.quotation = this.storage.getQuotation()
    console.log(this.quotation.product)
    this.products = []
    this.dataService.getProducts().subscribe(res=>{
      this.products = res
    })
    this.storage.quotationFetched.subscribe(res=>{
      console.log('fetched')
      this.quotation = res
    })
    this.disabled = false
    this.nextClicked = false
  }

  ngOnInit(): void {
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('customer')
    this.storage.setQuotation(this.quotation)
  }

  next(){
    console.log(this.quotation)
    this.nextClicked = true
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('specifications')
  }

  reset(){
    if(this.quotation){

    }
  }

  cancel(){
    this.router.navigate(['/offertes'])
  }





}
