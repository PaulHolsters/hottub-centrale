import {EventEmitter, Injectable, OnDestroy} from "@angular/core";
import {ProductModel} from "../models/product/product.model";
import {SpecificationModel} from "../models/product/specification.model";
import {OptionModel} from "../models/product/option.model";
import {DataService} from "./data.service";
import {Observable} from "rxjs";
import {QuotationModel} from "../models/quotation/quotation.model";
import {QuotationSpecificationModel} from "../models/quotation/quotation-specification.model";
import {QuotationGetModel} from "../models/quotation/quotation.get.model";

@Injectable()
export class QuotationStorageService implements OnDestroy{
  message:string|undefined
  step:string|undefined
  stepChange:EventEmitter<string|undefined>
  quotationFetched:EventEmitter<QuotationModel>
  nextClicked = new EventEmitter<null>()
  previousClicked = new EventEmitter<null>()
  cancelClicked = new EventEmitter<null>()
  resetClicked = new EventEmitter<null>()
  saveClicked = new EventEmitter<null>()
  newItemClicked = new EventEmitter<string>()
  private clickConsumed = true
  quotation:QuotationModel
  initialQuotation:QuotationModel
  quotationGet:QuotationGetModel|undefined
  availableQuotationSpecifications:QuotationSpecificationModel[]|undefined
  private newQuotationSpecificationName:string|undefined
  private newQuotationSpecificationPrice:number|undefined

  constructor(private dataService: DataService) {
    this.step = 'customer'
    this.stepChange = new EventEmitter<string|undefined>()
    this.quotationFetched = new EventEmitter<QuotationModel>()
    this.quotation = new QuotationModel(1, undefined, [], [], {
      firstName: undefined,
      lastName: undefined,
      email: undefined
    }, 21, 0, undefined)
    this.initialQuotation = new QuotationModel(1, undefined, [], [], {
      firstName: undefined,
      lastName: undefined,
      email: undefined
    }, 21, 0, undefined)
  }

  ngOnDestroy(): void {

  }

  resetInitialQuotation(){
    this.initialQuotation = new QuotationModel(1, undefined, [], [], {
      firstName: undefined,
      lastName: undefined,
      email: undefined
    }, 21, 0, undefined)
  }


  setInitialQuotation(quotation:QuotationModel){
    const init = {...quotation}
    init.customerInfo = {...quotation.customerInfo}
    init.options = [...quotation.options]
    if(quotation.product)
      init.product = {...quotation.product}
    init.quotationSpecifications = [...quotation.quotationSpecifications]
    this.initialQuotation = init
  }

  getInitialQuotation():QuotationModel{
    const init = {...this.initialQuotation}
    init.customerInfo = {...this.initialQuotation.customerInfo}
    init.options = [...this.initialQuotation.options]
    if(this.initialQuotation.product)
    init.product = {...this.initialQuotation.product}
    init.quotationSpecifications = [...this.initialQuotation.quotationSpecifications]
    return init
  }

  getAvailableQuotationSpecificationsNoSub():QuotationSpecificationModel[]|undefined{
    if(this.availableQuotationSpecifications)
      return [...this.availableQuotationSpecifications]
    return undefined
  }

  getStep() {
    return this.step
  }

  setStep(step: string) {
    this.step = step
    this.stepChange.emit(this.step)
  }

  resetStep(){
    this.step = 'customer'
  }

  getClickConsumed(){
    return this.clickConsumed
  }

  setClickConsumed(value:boolean){
    this.clickConsumed = value
  }

  setMessage(msg:string){
    this.message = msg
  }

  resetMessage(){
    this.message = undefined
  }

  hasMessage(){
    return this.message!==undefined
  }

  getMessage(){
    return this.message
  }

  getQuotation():QuotationModel{
    const quotationCopy = {...this.quotation}
    return quotationCopy
  }

  getQuotationGet():QuotationGetModel|undefined{
    if(this.quotationGet){
      return {...this.quotationGet}
    }
    return this.quotationGet
  }

  setQuotation(quotation:QuotationModel){
    this.quotation = quotation
  }

  setQuotationGet(quotation:QuotationGetModel){
    this.quotationGet = quotation
  }

  resetQuotation(){
    this.quotation = new QuotationModel(1, undefined, [], [], {
      firstName: undefined,
      lastName: undefined,
      email: undefined
    }, 21, 0, undefined)
  }

  resetQuotationGet(){
    this.quotationGet = undefined
  }

  getAvailableQuotationSpecifications():Observable<QuotationSpecificationModel[]> {
    return this.dataService.getQuotationSpecifications()
  }

  setAvailableQuotationSpecifications(newList:QuotationSpecificationModel[]){
    this.availableQuotationSpecifications = []
    newList.forEach(opt=>{
      this.availableQuotationSpecifications?.push({...opt})
    })
  }

  resetAvailableQuotationSpecifications(){
    this.availableQuotationSpecifications = undefined
  }

  getStateAvailableQuotationSpecifications():boolean{
    return this.availableQuotationSpecifications===undefined
  }

  setQuotationSpecificationNameInput(newQuotationSpecificationName:string|undefined){
    this.newQuotationSpecificationName = newQuotationSpecificationName
  }

  getQuotationSpecificationNameInput(){
    return this.newQuotationSpecificationName
  }

  setQuotationSpecificationPriceInput(newQuotationSpecificationPrice:number|undefined){
    this.newQuotationSpecificationPrice = newQuotationSpecificationPrice
  }

  getQuotationSpecificationPriceInput(){
    return this.newQuotationSpecificationPrice
  }
}
