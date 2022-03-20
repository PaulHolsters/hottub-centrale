import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {Router} from "@angular/router";
import {ProductModel} from "../../../models/product/product.model";
import {DataService} from "../../../services/data.service";
import {QuotationSpecificationModel} from "../../../models/quotation/quotation-specification.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-product',
  templateUrl: './quotation-product.component.html',
  styleUrls: ['./quotation-product.component.css']
})
export class QuotationProductComponent implements OnInit,OnDestroy {
  quotation: QuotationModel
  products:ProductModel[]
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='product' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='product' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='product' && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='product' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
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
    this.storage.setStep('customer')
    this.storage.setQuotation(this.quotation)
  }

  next(){
    this.storage.setClickConsumed(true)
    console.log(this.quotation)
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('specifications')
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
