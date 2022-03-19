import {AfterViewChecked, AfterViewInit, Component, DoCheck, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {ProductModel} from "../../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductStorageService} from "../../../services/product.storage.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit,OnDestroy,AfterViewInit,DoCheck{
  product: ProductModel
  nextSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  constructor(private router:Router, private storage:ProductStorageService) {
    console.log('getting product from info 1')
    this.product = this.storage.getProduct()
    this.storage.productFetched.subscribe(res=>{
      this.product = res
    })
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='info' && !this.storage.getClickConsumed()){
        //console.log('executing next for',this.product)
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='info' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='info'  && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
  }

  ngOnInit(): void {
    //console.log('init info',this.storage.getProduct())
  }

  ngDoCheck(): void {
    //console.log(this.product,'do')
  }

  ngAfterViewInit(): void {
    //console.log(this.product,'view')
  }

  ngOnDestroy(): void {
    this.nextSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  next(){
    //console.log('call from info')
    this.storage.setProduct(this.product)
    this.storage.setStep('specifications')
    this.storage.setClickConsumed(true)
  }

  reset(){
    if(this.product){
      this.product.name = undefined
      this.product.cat = 'hottub'
      this.product.price = undefined
      this.storage.setClickConsumed(true)
    }
  }

  cancel(){
    this.router.navigate(['/producten'])
    this.storage.setClickConsumed(true)
  }

}
