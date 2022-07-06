import { Component, OnInit } from '@angular/core';
import {MenuItem} from "primeng/api";
import {QuotationStorageService} from "../../services/quotation.storage.service";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../services/data.service";
import {QuotationModel} from "../../models/quotation/quotation.model";
import {ProductModel} from "../../models/product/product.model";
import {QuotationSpecificationModel} from "../../models/quotation/quotation-specification.model";
import {BreadcrumbStorageService} from "../../services/breadcrumb.storage.service";

@Component({
  selector: 'app-quotation-flow',
  templateUrl: './quotation-flow.component.html',
  styleUrls: ['./quotation-flow.component.css']
})
export class QuotationFlowComponent implements OnInit {
  id: string|undefined
  orphans:boolean
  productChanged:boolean
  step: string|undefined
  index: number
  items: MenuItem[]
  blocked: boolean
  constructor(private storage:QuotationStorageService,private route:ActivatedRoute,private dataService:DataService,
              private breadcrumbStorage:BreadcrumbStorageService) {
    this.productChanged = false
    this.orphans = false
    this.blocked = false
    this.step = this.storage.getStep()
    this.index = this.getIndex()
    this.items = [
      {label: 'Klantgegevens'},
      {label: 'Productgegevens'},
      {label: 'Extra diensten'},
      {label: 'Opties'},
      {label: 'Samenvatting'},
    ]
  }

  onProductChanged(productId:string){
    this.productChanged = productId !== this.storage.getInitialQuotation().product?._id
  }

  newItem(type:string){
    this.storage.setClickConsumed(false)
    this.storage.newItemClicked.emit(type)
  }

  ngOnInit(): void {
    this.storage.stepChange.subscribe(step=>{
      this.step = step
      this.index = this.getIndex()
    })
    this.id = this.route.snapshot.params['id']
    if(this.id){
      this.breadcrumbStorage.routeChange.emit([
        {label:'Offertes',routerLink:'offertes'},
        {label:'Nieuwe versie'}
      ])
      this.dataService.getQuotation(this.id).subscribe(res=>{
        this.storage.setQuotationGet(res)
        const product = new ProductModel(res.quotationValues.productName,res.quotationValues.productCat,res.quotationValues.productPrice,
            res.quotationValues.productSpecifications,res.quotationValues.optionValues,res.productId)
        const prefilledQuotation = new QuotationModel(res.version,product,res.selectedOptions,res.quotationValues.quotationSpecificationValues,
            res.customerInfo,res.VAT,res.discount,res.sendDate,res.creationDate,res._id)
        this.storage.quotationFetched.emit(prefilledQuotation)
        if(this.storage.getStateAvailableQuotationSpecifications()){
          this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecs=>{
            res.selectedQuotationSpecifications.forEach(specId=>{
              const index = quotSpecs.findIndex(specQuot=>{
                return specQuot._id===specId
              })
              if(index > -1){
                quotSpecs.splice(index,1)
              } else if(!this.orphans){
                this.orphans = true
              }
            })
            this.storage.setAvailableQuotationSpecifications(quotSpecs)
          })
        }
      })
    } else{
      this.breadcrumbStorage.routeChange.emit([
        {label:'Offertes',routerLink:'offertes'},
        {label:'Nieuwe offerte'}
      ])
      if(this.storage.getStateAvailableQuotationSpecifications()){
        this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecs=>{
          this.storage.setAvailableQuotationSpecifications(quotSpecs)
        })
      }
    }
  }

  getIndex():number{
    switch (this.step){
      case 'product':
        return 1
      case 'specifications':
        return 2
      case 'options':
        return 3
      case 'summary':
        return 4
    }
    return 0
  }

  ngOnDestroy(): void {
    this.storage.resetQuotation()
    this.storage.resetInitialQuotation()
    this.storage.resetQuotationGet()
    this.storage.resetAvailableQuotationSpecifications()
    this.storage.resetStep()
  }

  next(){
    this.storage.setClickConsumed(false)
    this.storage.nextClicked.emit()
  }

  cancel(){
    this.storage.setClickConsumed(false)
    this.storage.cancelClicked.emit()
  }

  previous(){
    this.storage.setClickConsumed(false)
    this.storage.previousClicked.emit()
  }

  changeStep(newIndex:number){
    switch (newIndex) {
      case 1:
        this.storage.setStep('product')
        break
      case 2:
        this.storage.setStep('specifications')
        break
      case 3:
        this.storage.setStep('options')
        break
      case 4:
        this.storage.setStep('summary')
        break
      default:
        this.storage.setStep('customer')
    }
    this.storage.newStepChange.emit(this.storage.getNewStep())
  }

  reset(){
    this.storage.setClickConsumed(false)
    this.storage.resetClicked.emit()
  }

  save(){
    this.blocked = true
    this.storage.setClickConsumed(false)
    this.storage.saveClicked.emit()
  }

  includesQuotSpec(arr:QuotationSpecificationModel[],quotSpec:QuotationSpecificationModel){
    const quots = arr.find(qs=>{
      return qs._id === quotSpec._id
    })
    return quots?.name === quotSpec.name && quots.price === quotSpec.price
  }

  equalArray(arr1:string[],arr2:string[]){
    return arr1.every(x=>arr2.includes(x)) && arr2.every(x=>arr1.includes(x))
  }

  equalQuotSpecs(arr1:QuotationSpecificationModel[],arr2:QuotationSpecificationModel[]){
    return arr1.every(x=>this.includesQuotSpec(arr2,x)) && arr2.every(x=>this.includesQuotSpec(arr1,x))
  }


  equalQuotation(quot1:QuotationModel,quot2:QuotationModel){
    return (quot1.VAT===quot2.VAT
        && quot1.product?._id===quot2.product?._id
        &&  quot1.customerInfo.firstName?.trim()===quot2.customerInfo.firstName?.trim()
        &&  quot1.customerInfo.lastName?.trim()===quot2.customerInfo.lastName?.trim()
        &&  quot1.customerInfo.email?.trim()===quot2.customerInfo.email?.trim()
        &&  quot1.discount===quot2.discount
        && this.equalArray(quot1.options,quot2.options)
        && this.equalQuotSpecs(quot1.quotationSpecifications,quot2.quotationSpecifications)
    )
  }

  isDisabled():boolean{
    const quot = this.storage.getQuotation()
    const init = this.storage.getInitialQuotation()
    return !quot.product || !quot.customerInfo.firstName || !quot.customerInfo.lastName|| !quot.customerInfo.email
    || (this.equalQuotation(quot,init))
  }

}
