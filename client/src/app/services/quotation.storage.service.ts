import {EventEmitter, Injectable} from "@angular/core";
import {ProductModel} from "../models/product/product.model";
import {SpecificationModel} from "../models/product/specification.model";
import {OptionModel} from "../models/product/option.model";
import {DataService} from "./data.service";
import {Observable} from "rxjs";
import {QuotationModel} from "../models/quotation/quotation.model";
import {QuotationSpecificationModel} from "../models/quotation/quotation-specification.model";
import {QuotationGetModel} from "../models/quotation/quotation.get.model";

@Injectable()
export class QuotationStorageService {

  message:string|undefined
  step:string|undefined
  stepChange:EventEmitter<string|undefined>
  quotationFetched:EventEmitter<QuotationModel>
  quotation:QuotationModel
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
    if (!this.availableQuotationSpecifications) {
      return this.dataService.getQuotationSpecifications()
    }
    return new Observable((observer)=>{
      if(this.availableQuotationSpecifications)
        observer.next([...this.availableQuotationSpecifications])
    })
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
