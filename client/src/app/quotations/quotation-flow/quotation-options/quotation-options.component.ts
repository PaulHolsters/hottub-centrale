import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {ProductModel} from "../../../models/product/product.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-options',
  templateUrl: './quotation-options.component.html',
  styleUrls: ['./quotation-options.component.css']
})
export class QuotationOptionsComponent implements OnInit,OnDestroy {
  quotation: QuotationModel
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='options' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.quotation = this.storage.getQuotation()
    console.log(this.quotation.product?.options)
    this.storage.quotationFetched.subscribe(res=>{
      this.quotation = res
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.nextSub.unsubscribe()
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  previous() {
    this.storage.setClickConsumed(true)
    this.storage.setStep('specifications')
    this.storage.setQuotation(this.quotation)
  }

  next(){
    this.storage.setClickConsumed(true)
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('summary')
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
