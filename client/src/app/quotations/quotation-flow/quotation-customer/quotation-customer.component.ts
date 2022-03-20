import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductModel} from "../../../models/product/product.model";
import {ProductStorageService} from "../../../services/product.storage.service";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {Router} from "@angular/router";
import {QuotationGetModel} from "../../../models/quotation/quotation.get.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-customer',
  templateUrl: './quotation-customer.component.html',
  styleUrls: ['./quotation-customer.component.css']
})
export class QuotationCustomerComponent implements OnInit,OnDestroy {
  quotation: QuotationModel
  nextSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private storage:QuotationStorageService, private router: Router) {
    this.quotation = this.storage.getQuotation()
    this.storage.quotationFetched.subscribe(res=>{
      this.quotation = res
      console.log('setting quotation',res)
    })

    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='customer' && !this.storage.getClickConsumed()){
        //console.log('executing next for',this.product)
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='customer' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='customer'  && !this.storage.getClickConsumed()){
        this.reset()
      }
    })

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.nextSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  next(){
    this.storage.setClickConsumed(true)
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('product')
  }

  reset(){
    this.storage.setClickConsumed(true)
    if(this.quotation){

    }
  }

  cancel(){
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

}
