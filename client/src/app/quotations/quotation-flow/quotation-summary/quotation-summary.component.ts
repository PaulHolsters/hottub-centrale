import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../../services/data.service";
import {MessageService} from "primeng/api";
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {OptionModel} from "../../../models/product/option.model";
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-summary',
  templateUrl: './quotation-summary.component.html',
  styleUrls: ['./quotation-summary.component.css']
})
export class QuotationSummaryComponent implements OnInit,OnDestroy {
  @Output() afterSave:EventEmitter<null>
  previousSub:Subscription
  cancelSub:Subscription
  saveSub:Subscription
  quotation:QuotationModel
  selectedOptions:OptionModel[]|undefined
  constructor(private storage:QuotationStorageService,
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
    this.quotation = this.storage.getQuotation()
    this.selectedOptions = []
    this.selectedOptions = this.quotation.product?.options.filter(opt=>{
      return (opt._id) && this.quotation.options.includes(opt._id)
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.saveSub.unsubscribe()
  }

  save(){
    this.storage.setClickConsumed(true)
    if(this.route.snapshot.params['id']){
      const previousQuotation = this.storage.getQuotationGet()
      if(previousQuotation){
        if(this.quotation.product && this.quotation.product._id) previousQuotation.productId = this.quotation.product._id
        if(this.quotation.options) previousQuotation.selectedOptions = [...this.quotation.options]
        previousQuotation.selectedQuotationSpecifications = this.quotation.quotationSpecifications.map(quotspec => {
          return quotspec._id || ''
        })
        previousQuotation.customerInfo.firstName = this.quotation.customerInfo.firstName || ''
        previousQuotation.customerInfo.lastName = this.quotation.customerInfo.lastName || ''
        previousQuotation.customerInfo.email = this.quotation.customerInfo.email || ''
        previousQuotation.VAT = this.quotation.VAT
        previousQuotation.discount = this.quotation.discount
        previousQuotation.previousVersionId = previousQuotation._id
      }
      if(previousQuotation)
        this.dataService.editQuotation(previousQuotation).subscribe(res=>{
          this.storage.setMessage('Nieuwe versie bewaard')
          this.router.navigate(['/offertes'])
          // todo zet blocked terug op false
          this.afterSave?.emit()
        },err=>{
          this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
          // todo zet blocked terug op false
          this.afterSave?.emit()
        })
    } else{
      this.dataService.createQuotation(this.quotation).subscribe(res => {
        this.storage.setMessage('Offerte bewaard')
        this.router.navigate(['/offertes'])
        // todo zet blocked terug op false
        this.afterSave?.emit()
      },err=>{
        this.messageService.add({key: 'errorMsg', severity:'error', summary: err.error.error, life:5000});
        // todo zet blocked terug op false
        this.afterSave?.emit()
      })
    }
  }


  previous() {
    this.storage.setClickConsumed(true)
    this.storage.setStep('options')
  }

  cancel() {
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

  // todo zorg ervoor dat als je een offerte aanpast enkel geldige waarden gebruikt worden
  //  dwz producten die effectief bestaan met al hun eig en offerte specs die bestaan

  // todo zorg ervoor dat je in de frontend geen offertes kan aanpassen die al zijn gefactureerd of een status 'akkoord' hebben

}
