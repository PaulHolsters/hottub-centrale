import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {ActivatedRoute, Router} from "@angular/router";
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
  initialQuotation: QuotationModel
  constructor(private route: ActivatedRoute,private storage:QuotationStorageService, private router: Router) {
    this.quotation = this.storage.getQuotation()
    this.initialQuotation = this.storage.getInitialQuotation()
    this.storage.quotationFetched.subscribe(res=>{
      this.quotation = {...res}
      if(!this.initialQuotation._id){
        this.storage.setInitialQuotation({...res})
        this.initialQuotation = this.storage.getInitialQuotation()
      }
    })
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='customer' && !this.storage.getClickConsumed()){
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
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('product')
    this.storage.setClickConsumed(true)
  }

  reset(){
    this.storage.setClickConsumed(true)
    if(this.quotation){
      if(this.route.snapshot.params['id']){
        this.quotation.customerInfo.firstName = this.initialQuotation.customerInfo.firstName
        this.quotation.customerInfo.lastName = this.initialQuotation.customerInfo.lastName
        this.quotation.customerInfo.email = this.initialQuotation.customerInfo.email
      } else{
        this.quotation.customerInfo.firstName = undefined
        this.quotation.customerInfo.lastName = undefined
        this.quotation.customerInfo.email = undefined
      }
    }
  }

  cancel(){
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

}
