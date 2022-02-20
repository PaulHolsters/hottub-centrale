import { Component, OnInit } from '@angular/core';
import {MenuItem} from "primeng/api";
import {QuotationStorageService} from "../../services/quotation.storage.service";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../services/data.service";

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
        this.storage.quotationFetched.emit(res)
        this.storage.getAvailableQuotationSpecifications().subscribe(quotSpecs=>{
          res.selectedQuotationSpecifications.forEach(specId=>{
            quotSpecs.splice(quotSpecs.findIndex(specQuot=>{
              return specQuot._id===specId
            }),1)
          })
          this.storage.setAvailableQuotationSpecifications(quotSpecs)
        })
        // todo options!
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
