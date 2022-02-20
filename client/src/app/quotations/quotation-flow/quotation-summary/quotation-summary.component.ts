import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {MessageService} from "primeng/api";
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {OptionModel} from "../../../models/product/option.model";

@Component({
  selector: 'app-quotation-summary',
  templateUrl: './quotation-summary.component.html',
  styleUrls: ['./quotation-summary.component.css']
})
export class QuotationSummaryComponent implements OnInit {
  previousClicked: boolean
  quotation:QuotationModel
  selectedOptions:OptionModel[]|undefined
  constructor(private storage:QuotationStorageService,
              private router:Router,
              private dataService:  DataService,
              private messageService:MessageService,
              private route:ActivatedRoute) {
    this.previousClicked = false
    this.quotation = this.storage.getQuotation()
    this.selectedOptions = []
    this.selectedOptions = this.quotation.product?.options.filter(opt=>{
      return (opt._id) && this.quotation.options.includes(opt._id)
    })
  }

  ngOnInit(): void {
  }

  save(){
    if(this.route.snapshot.params['id']){
/*      this.dataService.editProduct(this.product).subscribe(res=>{
        this.storage.setMessage('Product aangepast')
        this.router.navigate(['/producten/overzicht'])
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
      })*/
    } else{
      this.dataService.createQuotation(this.quotation).subscribe(res => {
        this.storage.setMessage('Offerte bewaard')
        this.router.navigate(['/offertes'])
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
      })
    }
  }

  isDisabled(){
    return false
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('options')
  }

  cancel() {
    this.router.navigate(['/offertes'])
  }

}
