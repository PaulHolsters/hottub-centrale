import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {ProductModel} from "../../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {MessageService} from "primeng/api";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.css'],
  providers: []
})
export class ProductSummaryComponent implements OnInit,OnDestroy {
  product:ProductModel

  previousSub:Subscription
  cancelSub:Subscription
  saveSub:Subscription

  constructor(private storage:ProductStorageService,
              private router:Router,
              private dataService:  DataService,
              private messageService:MessageService,
              private route:ActivatedRoute) {
    this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='summary' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='summary' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='summary' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.saveSub = this.storage.saveClicked.subscribe(()=>{
      if(this.storage.getStep()==='summary' && !this.storage.getClickConsumed()){
        this.save()
      }
    })
    console.log('getting product from summary 1')
    this.product = this.storage.getProduct()
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.saveSub.unsubscribe()
  }

  save(){
    if(this.route.snapshot.params['id']){
      this.dataService.editProduct(this.product).subscribe(res=>{
        this.storage.setMessage('Product aangepast')
        this.router.navigate(['/producten/overzicht'])
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
      })
    } else{
      this.dataService.createProduct(this.product).subscribe(res => {
        this.storage.setMessage('Product bewaard')
        this.router.navigate(['/producten'])
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
      })
    }
    this.storage.setClickConsumed(true)
  }

  previous() {
    this.storage.setStep('options')
    this.storage.setClickConsumed(true)
  }

  cancel() {
    this.router.navigate(['/producten'])
    this.storage.setClickConsumed(true)
  }

}
