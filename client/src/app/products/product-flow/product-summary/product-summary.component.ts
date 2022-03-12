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
  previousClicked: boolean
  product:ProductModel

  constructor(private storage:ProductStorageService,
              private router:Router,
              private dataService:  DataService,
              private messageService:MessageService,
              private route:ActivatedRoute) {
    this.storage.cancelClicked.subscribe(()=>{
      this.cancel()
    })
    this.storage.previousClicked.subscribe(()=>{
      this.previous()
    })
    this.storage.saveClicked.subscribe(()=>{
      this.save()
    })
    this.previousClicked = false
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
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('options')
  }

  cancel() {
    this.router.navigate(['/producten'])
  }

}
