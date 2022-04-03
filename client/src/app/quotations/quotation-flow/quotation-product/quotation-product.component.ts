import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductModel} from "../../../models/product/product.model";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-product',
  templateUrl: './quotation-product.component.html',
  styleUrls: ['./quotation-product.component.css']
})
export class QuotationProductComponent implements OnInit,OnDestroy {
  quotation: QuotationModel
  initialQuotation:QuotationModel|undefined
  products:ProductModel[]
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  destroyed:boolean|undefined
  constructor(private route: ActivatedRoute,private storage:QuotationStorageService, private router: Router,private dataService:DataService) {
    console.log('constr prod')
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
    this.initialQuotation = this.storage.getInitialQuotation()
    this.products = []
    this.dataService.getProducts().subscribe(res=>{
      this.products = res
    })
  }

  ngOnInit(): void {
    console.log('init product quot')
  }

  ngOnDestroy() {
      if(this.nextSub)
        this.nextSub.unsubscribe()
      if(this.previousSub)
        this.previousSub.unsubscribe()
      if(this.cancelSub)
        this.cancelSub.unsubscribe()
      if(this.resetSub)
        this.resetSub.unsubscribe()
      console.log('destr prod')
    }

  previous() {
    this.storage.setStep('customer')
    this.storage.setQuotation(this.quotation)
    this.storage.setClickConsumed(true)
  }

  next(){
    this.storage.setClickConsumed(true)
    this.storage.setQuotation(this.quotation)
    this.storage.setStep('specifications')
  }

  reset(){
    this.storage.setClickConsumed(true)
    if(this.quotation && this.initialQuotation){
      if(this.route.snapshot.params['id']){
        this.quotation.product = this.initialQuotation.product
        this.quotation.VAT = this.initialQuotation.VAT
        this.quotation.discount = this.initialQuotation.discount
      } else{
        this.quotation.product = undefined
        this.quotation.VAT = 21
        this.quotation.discount = 0
      }
    }
  }

  cancel(){
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }





}
