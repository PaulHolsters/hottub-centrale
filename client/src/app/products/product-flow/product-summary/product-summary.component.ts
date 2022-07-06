import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
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
  @Output() afterSave:EventEmitter<null>
  product:ProductModel
  previousSub:Subscription
  cancelSub:Subscription
  saveSub:Subscription
  stepChangedSub:Subscription
  constructor(private storage:ProductStorageService,
              private router:Router,
              private dataService:  DataService,
              private messageService:MessageService,
              private route:ActivatedRoute) {
    this.afterSave = new EventEmitter<null>()
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='summary' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.stepChangedSub = this.storage.newStepChange.subscribe((newStep)=>{
      if(this.storage.getStep()==='summary'){
        this.storage.setStep(newStep)
        this.storage.resetNewStep()
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

    this.product = this.storage.getProduct()
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.saveSub.unsubscribe()
    this.stepChangedSub.unsubscribe()
  }



  save(){
    if(this.route.snapshot.params['id']){
      this.dataService.editProduct(this.product).subscribe(res=>{
        this.storage.setMessage('Product aangepast')
        this.router.navigate(['/producten/overzicht'])
        this.afterSave.emit()
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
        this.afterSave.emit()
      })
    } else{
      this.dataService.createProduct(this.product).subscribe(res => {
        this.storage.setMessage('Product bewaard')
        this.router.navigate(['/producten'])
        this.afterSave.emit()
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
        this.afterSave.emit()
      })
    }
    this.storage.setClickConsumed(true)
  }

  previous() {
    this.storage.setStep('options')
    this.storage.setClickConsumed(true)
  }

  cancel() {
    this.router.navigate(['/producten/overzicht'])
    this.storage.setClickConsumed(true)
  }

}
