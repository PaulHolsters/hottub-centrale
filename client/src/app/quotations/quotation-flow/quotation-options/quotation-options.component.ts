import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {ProductModel} from "../../../models/product/product.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-options',
  templateUrl: './quotation-options.component.html',
  styleUrls: ['./quotation-options.component.css']
})
export class QuotationOptionsComponent implements OnInit,OnDestroy {
  quotation: QuotationModel
  initialQuotation: QuotationModel
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private route:ActivatedRoute,private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
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
    this.initialQuotation = this.storage.getInitialQuotation()
    // todo in product zit onder bepaalde omstandigheden niks van opties
    console.log(this.quotation.product?.options)
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
      if(this.route.snapshot.params['id']){
        console.log(this.quotation.options,this.initialQuotation.options)
        this.quotation.options = []
        this.initialQuotation.options.forEach(opt=>{
          this.quotation.options.push(opt)
        })
      } else{
        this.quotation.options = []
      }
    }
  }

  cancel(){
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

}
