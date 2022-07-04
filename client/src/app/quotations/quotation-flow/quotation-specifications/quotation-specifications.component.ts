import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {OptionModel} from "../../../models/product/option.model";
import {QuotationSpecificationModel} from "../../../models/quotation/quotation-specification.model";
import {DataService} from "../../../services/data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-quotation-specifications',
  templateUrl: './quotation-specifications.component.html',
  styleUrls: ['./quotation-specifications.component.css']
})
export class QuotationSpecificationsComponent implements OnInit,OnDestroy {
  quotation:QuotationModel
  initialQuotation:QuotationModel|undefined
  newQuotationSpecificationName: string|undefined
  newQuotationSpecificationPrice: number|undefined
  nextSub:Subscription
  previousSub:Subscription
  cancelSub:Subscription
  resetSub:Subscription
  newItemSub:Subscription
  stepChangedSub:Subscription
  availableQuotationSpecifications: QuotationSpecificationModel[]
  loading: boolean
  displayNewQuotationSpecificationDialog: boolean
  constructor(private route: ActivatedRoute,private storage:QuotationStorageService,private dataService:DataService,private router:Router) {
    this.newItemSub = this.storage.newItemClicked.subscribe((itemType)=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed() && itemType === 'specification'){
        this.displayNewQuotationSpecificationDialog = true
        this.storage.setClickConsumed(true)
      }
    })
    this.nextSub = this.storage.nextClicked.subscribe(()=>{
      if(this.storage.getStep()==='specifications' && !this.storage.getClickConsumed()){
        this.next()
      }
    })
    this.stepChangedSub = this.storage.newStepChange.subscribe((newStep)=>{
      if(this.storage.getStep()==='specifications'){
        this.storage.setStep(newStep)
        this.storage.resetNewStep()
        this.store(null)
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
    this.initialQuotation = this.storage.getInitialQuotation()
    this.newQuotationSpecificationName = this.storage.getQuotationSpecificationNameInput()
    this.newQuotationSpecificationPrice = this.storage.getQuotationSpecificationPriceInput()
    this.availableQuotationSpecifications= this.storage.getAvailableQuotationSpecificationsNoSub()||[]
    this.loading = false
    this.displayNewQuotationSpecificationDialog = false
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.nextSub.unsubscribe()
    this.previousSub.unsubscribe()
    this.cancelSub.unsubscribe()
    this.resetSub.unsubscribe()
    this.stepChangedSub.unsubscribe()
  }

  store(lists: { source: QuotationSpecificationModel[], target: QuotationSpecificationModel[] } | null) {
    if (lists) {
      this.quotation.quotationSpecifications = lists.target
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
    this.availableQuotationSpecifications= this.storage.getAvailableQuotationSpecificationsNoSub()||[]
  }

  addQuotationSpecification() {
    if(this.newQuotationSpecificationName){
      let newQuotationSpecification
      if(this.newQuotationSpecificationPrice){
        newQuotationSpecification = new QuotationSpecificationModel(this.newQuotationSpecificationName.trim(),this.newQuotationSpecificationPrice)
      } else{
        newQuotationSpecification = new QuotationSpecificationModel(this.newQuotationSpecificationName.trim(),0)
      }
      this.loading = true
      this.dataService.createQuotationSpecification(newQuotationSpecification).subscribe(quotspec=> {
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
      if(this.route.snapshot.params['id']){
        this.storage.getAvailableQuotationSpecifications().subscribe(quotspecs => {
          if(this.initialQuotation?.quotationSpecifications)
          this.quotation.quotationSpecifications = [...this.initialQuotation?.quotationSpecifications] || []
          if(this.quotation.quotationSpecifications.length>0){
            this.availableQuotationSpecifications = quotspecs.filter(quotspec=>{
              return !this.quotation.quotationSpecifications.map(qs=>{
                return qs._id
              }).includes(quotspec._id)
            })
          } else{
            this.availableQuotationSpecifications = quotspecs
          }
          this.storage.setAvailableQuotationSpecifications([...this.availableQuotationSpecifications])
        })
      } else{
        this.quotation.quotationSpecifications = []
        this.availableQuotationSpecifications = []
        this.newQuotationSpecificationName = undefined
        this.newQuotationSpecificationPrice = undefined
        this.storage.resetAvailableQuotationSpecifications()
        this.storage.getAvailableQuotationSpecifications().subscribe(quotspecs => {
          this.storage.setAvailableQuotationSpecifications(quotspecs)
          this.availableQuotationSpecifications = this.storage.getAvailableQuotationSpecificationsNoSub()||[]
        })
      }
    }
  }

  cancel() {
    this.storage.setClickConsumed(true)
    this.router.navigate(['/offertes'])
  }

  cancelAdding(){
    this.displayNewQuotationSpecificationDialog = false
  }

  isDisabled(){
    return false
  }

}

