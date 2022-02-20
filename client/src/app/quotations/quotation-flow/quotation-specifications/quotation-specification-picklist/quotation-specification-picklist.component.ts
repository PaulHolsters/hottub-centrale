import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {DataService} from "../../../../services/data.service";
import {QuotationSpecificationModel} from "../../../../models/quotation/quotation-specification.model";
import {QuotationStorageService} from "../../../../services/quotation.storage.service";

@Component({
  selector: 'app-quotation-specification-picklist',
  templateUrl: './quotation-specification-picklist.component.html',
  styleUrls: ['./quotation-specification-picklist.component.css']
})
export class QuotationSpecificationPicklistComponent implements OnInit {
  @Input() source: QuotationSpecificationModel[]
  @Input() target: QuotationSpecificationModel[]
  @Output() listChanged = new EventEmitter<{source:QuotationSpecificationModel[],target:QuotationSpecificationModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:QuotationSpecificationModel[],target:QuotationSpecificationModel[]}>()
  constructor(private storage: QuotationStorageService, private dataService: DataService) {
    this.source = []
    this.target = []
  }

  ngOnInit(): void {
  }

  deleteOption(id:string){
    this.dataService.deleteOption(id).subscribe(res=>{
      // inform parent to rerender this component
      this.source.splice(this.source.findIndex(spec=>{
        return spec._id===id
      }),1)
      this.listChanged.emit({source:this.source,target:this.target})
    })
  }

  store(){
    // call the store function of the parent without rerendering this component
    // while passing the source and the target
    // the the parent should update its lists via the store ?
    this.storeEvent.emit({source:this.source,target:this.target})
  }

  editOption(id:string){
    // open a dialog where the user can edit this specification
    // inform the parent to rerender this component
    this.listChanged.emit({source:this.source,target:this.target})
  }

}
