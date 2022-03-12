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
  disabled: boolean
  nextClicked: boolean

  constructor(private router:Router, private storage:ProductStorageService) {
    this.product = this.storage.getProduct()
    this.storage.productFetched.subscribe(res=>{
      this.product = res
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
    this.storage.setProduct(this.product)
    this.storage.setStep('specifications')
  }

  reset(){
    if(this.product){
      this.product.name = undefined
      this.product.cat = 'hottub'
      this.product.price = undefined
    }
  }

  cancel(){
    this.router.navigate(['/producten'])
  }

}
