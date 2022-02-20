import { Component, OnInit } from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {ProductModel} from "../../../models/product/product.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {Router} from "@angular/router";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-quotation-options',
  templateUrl: './quotation-options.component.html',
  styleUrls: ['./quotation-options.component.css']
})
export class QuotationOptionsComponent implements OnInit {
  quotation: QuotationModel
  disabled: boolean
  nextClicked: boolean
  previousClicked: boolean
  constructor(private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
    this.previousClicked = false
    this.quotation = this.storage.getQuotation()
    this.storage.quotationFetched.subscribe(res=>{
      this.quotation = res
    })
    this.disabled = false
    this.nextClicked = false
  }

  ngOnInit(): void {

  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('specifications')
    this.storage.setQuotation(this.quotation)
  }

  next(){
    this.nextClicked = true
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('summary')
  }

  reset(){
    if(this.quotation){

    }
  }

  cancel(){
    this.router.navigate(['/offertes'])
  }

}
