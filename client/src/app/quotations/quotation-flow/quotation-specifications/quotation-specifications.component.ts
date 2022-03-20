import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {OptionModel} from "../../../models/product/option.model";
import {QuotationSpecificationModel} from "../../../models/quotation/quotation-specification.model";
import {DataService} from "../../../services/data.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-specifications',
  templateUrl: './quotation-specifications.component.html',
  styleUrls: ['./quotation-specifications.component.css']
})
export class QuotationSpecificationsComponent implements OnInit,OnDestroy {
  quotation:QuotationModel
  newQuotationSpecificationName: string|undefined
  newQuotationSpecificationPrice: number|undefined
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  availableQuotationSpecifications: QuotationSpecificationModel[]
  loading: boolean
  constructor(private storage:QuotationStorageService,private dataService:DataService,private router:Router) {
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.cancelSub = this.storage.cancelClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.cancel()
      }
    })
    this.resetSub = this.storage.resetClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.reset()
      }
    })
    this.previousSub = this.storage.previousClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.previous()
      }
    })
    this.quotation = this.storage.getQuotation()
    this.newQuotationSpecificationName = this.storage.getQuotationSpecificationNameInput()
    this.newQuotationSpecificationPrice = this.storage.getQuotationSpecificationPriceInput()
    this.availableQuotationSpecifications= []
    this.loading = true
    this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecList => {
      this.availableQuotationSpecifications = quotSpecList
      this.loading = false
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.nextSub.unsubscribe()
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
  }

  store(lists: { source: QuotationSpecificationModel[], target: QuotationSpecificationModel[] } | null) {
    if (lists) {
      this.quotation.quotationSpecifications = lists.target
      console.log('targrte = ',this.quotation.quotationSpecifications )
      this.availableQuotationSpecifications = lists.source
    }
    this.storage.setQuotation(this.quotation)
    this.storage.setAvailableQuotationSpecifications(this.availableQuotationSpecifications)
    this.storage.setQuotationSpecificationNameInput(this.newQuotationSpecificationName)
    this.storage.setQuotationSpecificationPriceInput(this.newQuotationSpecificationPrice)
  }

  reload(lists:{source:QuotationSpecificationModel[],target:QuotationSpecificationModel[]}) {
    this.store(lists)
    this.quotation = this.storage.getQuotation()
    this.loading = true
    this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecList => {
      this.availableQuotationSpecifications = quotSpecList
      this.loading = false
    })
  }

  addQuotationSpecification() {
    if(this.newQuotationSpecificationName){
      let newQuotationSpecification
      if(this.newQuotationSpecificationPrice){
        newQuotationSpecification = new QuotationSpecificationModel(this.newQuotationSpecificationName.trim(),this.newQuotationSpecificationPrice)
      } else{
        newQuotationSpecification = new QuotationSpecificationModel(this.newQuotationSpecificationName.trim())
      }
      this.loading = true
      this.dataService.createQuotationSpecification(newQuotationSpecification).subscribe(quotspec=> {
        console.log('created')
        this.quotation.quotationSpecifications?.push(quotspec)
        this.newQuotationSpecificationName = undefined
        this.newQuotationSpecificationPrice = undefined
        this.store(null)
        this.loading = false
      })
    }
  }

  next(){
    this.storage.setClickConsumed(true)
    this.store(null)
    this.storage.setStep('options')
  }

  previous() {
    this.storage.setClickConsumed(true)
    this.storage.setStep('product')
    this.store(null)
  }

  reset() {
    this.storage.setClickConsumed(true)
    if (this.quotation && this.quotation.quotationSpecifications) {
      this.quotation.quotationSpecifications = []
      this.availableQuotationSpecifications = []
      this.storage.resetAvailableQuotationSpecifications()
      this.storage.getAvailableQuotationSpecifications().subscribe(quotspecs => {
        this.availableQuotationSpecifications = quotspecs
        this.newQuotationSpecificationName = undefined
        this.newQuotationSpecificationPrice = undefined
      })
    }
  }

  cancel() {
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

}

