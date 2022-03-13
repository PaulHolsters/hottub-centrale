import { Component, OnInit } from '@angular/core';
import {ProductModel} from "../../../models/product/product.model";
import {ProductStorageService} from "../../../services/product.storage.service";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {Router} from "@angular/router";
import {QuotationGetModel} from "../../../models/quotation/quotation.get.model";

@Component({
  selector: 'app-quotation-customer',
  templateUrl: './quotation-customer.component.html',
  styleUrls: ['./quotation-customer.component.css']
})
export class QuotationCustomerComponent implements OnInit {
  quotation: QuotationModel
  disabled: boolean
  nextClicked: boolean
  constructor(private storage:QuotationStorageService, private router: Router) {
    this.quotation = this.storage.getQuotation()
    this.storage.quotationFetched.subscribe(res=>{
      this.quotation = res
      console.log('setting quotation',res)
    })
    this.storage.nextClicked.subscribe(()=>{
      this.next()
    })
    this.storage.cancelClicked.subscribe(()=>{
      this.cancel()
    })
    this.storage.resetClicked.subscribe(()=>{
      this.reset()
    })
    this.disabled = false
    this.nextClicked = false
  }

  ngOnInit(): void {
  }

  next(){
    this.nextClicked = true
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('product')
  }

  reset(){
    if(this.quotation){

    }
  }

  cancel(){
    this.router.navigate(['/offertes'])
  }

}
