import { Component, OnInit } from '@angular/core';
import {MenuItem} from "primeng/api";
import {QuotationStorageService} from "../../services/quotation.storage.service";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../services/data.service";
import {QuotationModel} from "../../models/quotation/quotation.model";
import {ProductModel} from "../../models/product/product.model";

@Component({
  selector: 'app-quotation-flow',
  templateUrl: './quotation-flow.component.html',
  styleUrls: ['./quotation-flow.component.css']
})
export class QuotationFlowComponent implements OnInit {
  step: string|undefined
  index: number
  items: MenuItem[]
  constructor(private storage:QuotationStorageService,private route:ActivatedRoute,private dataService:DataService) {
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

  ngOnInit(): void {
    this.storage.stepChange.subscribe(step=>{
      this.step = step
      this.index = this.getIndex()
    })
    const id = this.route.snapshot.params['id']
    if(id){
      this.dataService.getQuotation(id).subscribe(res=>{
        // todo previousVersionId is undefined!
        console.log('versionid',res)
        this.storage.setQuotationGet(res)
        const product = new ProductModel(res.quotationValues.productName,res.quotationValues.productCat,res.quotationValues.productPrice,
            res.quotationValues.productSpecifications,res.quotationValues.optionValues,res.productId)
        const prefilledQuotation = new QuotationModel(res.version,product,res.selectedOptions,res.quotationValues.quotationSpecificationValues,
            res.customerInfo,res.VAT,res.discount,res._id)
        this.storage.quotationFetched.emit(prefilledQuotation)
        this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecs=>{
          res.selectedQuotationSpecifications.forEach(specId=>{
            quotSpecs.splice(quotSpecs.findIndex(specQuot=>{
              return specQuot._id===specId
            }),1)
          })
          this.storage.setAvailableQuotationSpecifications(quotSpecs)
        })
      })
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
    this.storage.resetAvailableQuotationSpecifications()
    this.storage.resetAvailableQuotationSpecifications()
    this.storage.resetStep()
  }

}
