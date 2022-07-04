import {EventEmitter, Injectable, OnDestroy} from "@angular/core";
import {ProductModel} from "../models/product/product.model";
import {SpecificationModel} from "../models/product/specification.model";
import {OptionModel} from "../models/product/option.model";
import {DataService} from "./data.service";
import {Observable} from "rxjs";

@Injectable()
export class ProductStorageService implements OnDestroy{

  constructor(private dataService: DataService) {
  }
  private product = new ProductModel(undefined, 'hottub', undefined, [], [])
  private initialProduct = new ProductModel(undefined, 'hottub', undefined, [], [])
  private availableSpecifications:SpecificationModel[]|undefined
  private availableOptions:OptionModel[]|undefined
  private step = 'info'
  private newOptionName:string|undefined
  private newOptionPrice:number|undefined
  stepChange = new EventEmitter<string>()
  newStepChange = new EventEmitter<string>()
  private newStep = ''

  private clickConsumed = true
  productFetched = new EventEmitter<ProductModel>()
  newItemClicked = new EventEmitter<string>()
  nextClicked = new EventEmitter<null>()
  previousClicked = new EventEmitter<null>()


  cancelClicked = new EventEmitter<null>()
  resetClicked = new EventEmitter<null>()
  saveClicked = new EventEmitter<null>()
  private message:string|undefined

  ngOnDestroy(): void {
  }

  resetInitialProduct(){
    this.initialProduct = new ProductModel(undefined, 'hottub', undefined, [], [])
  }

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

  getStateAvailableSpecifications():boolean{
    return this.availableSpecifications===undefined
  }

  getAvailableSpecifications():Observable<SpecificationModel[]> {
      return this.dataService.getSpecifications()
  }

  getAvailableSpecificationsNoSub():SpecificationModel[]|undefined{
    if(this.availableSpecifications)
    return [...this.availableSpecifications]
    return undefined
  }

  getAvailableOptionsNoSub():OptionModel[]|undefined{
    if(this.availableOptions)
      return [...this.availableOptions]
    return undefined
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

  getStateAvailableOptions():boolean{
    return this.availableOptions===undefined
  }

  getAvailableOptions():Observable<OptionModel[]> {
    return this.dataService.getOptions()
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
    this.stepChange.emit(step)
  }

  setNewStep(newStep: string){
    this.newStep = newStep
  }

  getNewStep(){
    return this.newStep
  }

  resetNewStep(){
    this.newStep = ''
  }

  setProduct(product: ProductModel) {
    this.product = product
  }

  setInitialProduct(product:ProductModel){
    this.initialProduct = product
  }

  getInitialProduct():ProductModel{
    const init = {...this.initialProduct}
    init.specifications = [...this.initialProduct.specifications]
    init.options = [...this.initialProduct.options]
    return init
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
