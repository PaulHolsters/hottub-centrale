import {Component, OnInit} from '@angular/core';
import {QuotationModel} from "../../../models/quotation/quotation.model";
import {QuotationStorageService} from "../../../services/quotation.storage.service";
import {OptionModel} from "../../../models/product/option.model";
import {QuotationSpecificationModel} from "../../../models/quotation/quotation-specification.model";
import {DataService} from "../../../services/data.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-quotation-specifications',
  templateUrl: './quotation-specifications.component.html',
  styleUrls: ['./quotation-specifications.component.css']
})
export class QuotationSpecificationsComponent implements OnInit {
  quotation:QuotationModel
  newQuotationSpecificationName: string|undefined
  newQuotationSpecificationPrice: number|undefined
  nextClicked: boolean
  previousClicked: boolean
  availableQuotationSpecifications: QuotationSpecificationModel[]
  loading: boolean
  constructor(private storage:QuotationStorageService,private dataService:DataService,private router:Router) {
    this.quotation = this.storage.getQuotation()
    this.newQuotationSpecificationName = this.storage.getQuotationSpecificationNameInput()
    this.newQuotationSpecificationPrice = this.storage.getQuotationSpecificationPriceInput()
    this.nextClicked = false
    this.previousClicked = false
    this.availableQuotationSpecifications= []
    this.loading = true
    this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecList => {
      this.availableQuotationSpecifications = quotSpecList
      this.loading = false
    })
  }

  ngOnInit(): void {
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
        this.quotation.quotationSpecifications?.push(quotspec)
        this.newQuotationSpecificationName = undefined
        this.newQuotationSpecificationPrice = undefined
        this.store(null)
        this.loading = false
      })
    }
  }

  next(){
    this.nextClicked = true
    this.store(null)
    this.storage.setStep('options')
  }

  previous() {
    this.previousClicked = true
    this.storage.setStep('product')
    this.store(null)
  }

  reset() {
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
    this.router.navigate(['/offertes'])
  }

}

