import {Component, OnInit, Output} from '@angular/core';
import {ProductStorageService} from "../../../services/product.storage.service";
import {ProductModel} from "../../../models/product/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.css'],
  providers: []
})
export class ProductSummaryComponent implements OnInit {
  product:ProductModel

  constructor(private storage:ProductStorageService,
              private router:Router,
              private dataService:  DataService,
              private messageService:MessageService,
              private route:ActivatedRoute) {
    this.storage.cancelClicked.subscribe((step)=>{
      if(step===this.storage.getStep() && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.storage.previousClicked.subscribe((step)=>{
      if(step===this.storage.getStep() && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.storage.saveClicked.subscribe((step)=>{
      if(step===this.storage.getStep() && !this.storage.getClickConsumed()){
        this.save()
      }
    })
    this.product = this.storage.getProduct()
  }

  ngOnInit(): void {

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
