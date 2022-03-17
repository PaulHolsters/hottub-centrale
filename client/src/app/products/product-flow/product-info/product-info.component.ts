import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProductModel} from "../../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductStorageService} from "../../../services/product.storage.service";

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit{
  product: ProductModel

  constructor(private router:Router, private storage:ProductStorageService) {
    this.product = this.storage.getProduct()
    this.storage.productFetched.subscribe(res=>{
      this.product = res
    })
    this.storage.nextClicked.subscribe((step)=>{
      if(step===this.storage.getStep() && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.storage.cancelClicked.subscribe((step)=>{
      if(step===this.storage.getStep()  && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.storage.resetClicked.subscribe((step)=>{
      if(step===this.storage.getStep() && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
  }

  ngOnInit(): void {

  }

  next(){
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
