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
  initialProduct: ProductModel
  nextSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  stepChangedSub:Subscription
  constructor(private router:Router, private storage:ProductStorageService, private route: ActivatedRoute) {
    this.product = this.storage.getProduct()
    this.initialProduct = this.storage.getInitialProduct()
    this.storage.productFetched.subscribe(res=>{
      this.product = {...res}
      if(!this.initialProduct._id){
        this.storage.setInitialProduct({...res})
        this.initialProduct = this.storage.getInitialProduct()
      }
    })
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='info' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.stepChangedSub = this.storage.newStepChange.subscribe((newStep)=>{
      if(this.storage.getStep()==='info'){
        this.storage.setProduct(this.product)
        this.storage.setStep(newStep)
        this.storage.resetNewStep()
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
    this.stepChangedSub.unsubscribe()
  }

  next(){
    this.storage.setProduct(this.product)
    this.storage.setStep('specifications')
    this.storage.setClickConsumed(true)
  }

  reset(){
    if(this.route.snapshot.params['id']){
      if(this.product){
        this.product.name = this.initialProduct.name
        this.product.cat = this.initialProduct.cat
        this.product.price = this.initialProduct.price
        this.storage.setClickConsumed(true)
      }
    } else{
      if(this.product){
        this.product.name = undefined
        this.product.cat = 'hottub'
        this.product.price = undefined
        this.storage.setClickConsumed(true)
      }
    }
  }

  cancel(){
    this.router.navigate(['/producten'])
    this.storage.setClickConsumed(true)
  }

}
