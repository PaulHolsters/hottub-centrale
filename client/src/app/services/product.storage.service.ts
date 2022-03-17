import {EventEmitter, Injectable} from "@angular/core";
import {ProductModel} from "../models/product/product.model";
import {SpecificationModel} from "../models/product/specification.model";
import {OptionModel} from "../models/product/option.model";
import {DataService} from "./data.service";
import {Observable} from "rxjs";

@Injectable()
export class ProductStorageService {

  constructor(private dataService: DataService) {
    console.log('storage init')
  }

  private product = new ProductModel(undefined, 'hottub', undefined, [], [])
  private availableSpecifications:SpecificationModel[]|undefined
  private availableOptions:OptionModel[]|undefined
  private step = 'info'
  private newSpecification:string|undefined
  private newOptionName:string|undefined
  private newOptionPrice:number|undefined
  stepChange = new EventEmitter<string>()
  private clickConsumed = true
  productFetched = new EventEmitter<ProductModel>()
  nextClicked = new EventEmitter<string>()
  previousClicked = new EventEmitter<string>()
  cancelClicked = new EventEmitter<string>()
  resetClicked = new EventEmitter<string>()
  saveClicked = new EventEmitter<string>()
  private message:string|undefined

  setMessage(msg:string){
    this.message = msg
  }

  getClickConsumed(){
    return this.clickConsumed
  }

  setClickConsumed(value:boolean){
    this.clickConsumed = value
  }

  resetMessage(){
    this.message = undefined
  }

  resetStep(){
    this.step = 'info'
  }

  hasMessage(){
    return this.message!==undefined
  }

  getMessage(){
    return this.message
  }

  getAvailableSpecifications():Observable<SpecificationModel[]> {
    if (!this.availableSpecifications) {
      return this.dataService.getSpecifications()
    }
      return new Observable((observer)=>{
        if(this.availableSpecifications)
        observer.next([...this.availableSpecifications])
      })
  }

  setAvailableSpecifications(newList:SpecificationModel[]){
    this.availableSpecifications = []
    newList.forEach(spec=>{
      this.availableSpecifications?.push({...spec})
    })
  }

  resetAvailableSpecifications(){
    this.availableSpecifications = undefined
  }

  getAvailableOptions():Observable<OptionModel[]> {
    if (!this.availableOptions) {
      return this.dataService.getOptions()
    }
    return new Observable((observer)=>{
      if(this.availableOptions)
      observer.next([...this.availableOptions])
    })
  }

  setAvailableOptions(newList:OptionModel[]){
    this.availableOptions = []
    newList.forEach(opt=>{
      this.availableOptions?.push({...opt})
    })
  }

  resetAvailableOptions(){
    this.availableOptions = undefined
  }

  setSpecificationInput(newSpecification:string|undefined){
    this.newSpecification = newSpecification
  }

  getSpecificationInput(){
    return this.newSpecification
  }

  setOptionNameInput(newOptionName:string|undefined){
    this.newOptionName = newOptionName
  }

  getOptionNameInput(){
    return this.newOptionName
  }

  setOptionPriceInput(newOptionPrice:number|undefined){
    this.newOptionPrice = newOptionPrice
  }

  getOptionPriceInput(){
    return this.newOptionPrice
  }

  getStep() {
    return this.step
  }

  setStep(step: string) {
    this.step = step
    this.stepChange.emit(this.step)
  }

  setProduct(product: ProductModel) {
    this.product = product
  }

  resetProduct() {
    this.product = new ProductModel(undefined, 'hottub', undefined, [], [])
  }

  getProduct(): ProductModel {
    const productCopy = {...this.product}
    if (this.product.specifications) {
      const specificationsCopy: SpecificationModel[] = []
      this.product.specifications.forEach(spec => {
        specificationsCopy.push({...spec})
      })
      productCopy.specifications = specificationsCopy
    }
    if (this.product.options) {
      const optionsCopy: OptionModel[] = []
      this.product.options.forEach(opt => {
        optionsCopy.push({...opt})
      })
      productCopy.options = optionsCopy
    }
    return productCopy
  }

}
