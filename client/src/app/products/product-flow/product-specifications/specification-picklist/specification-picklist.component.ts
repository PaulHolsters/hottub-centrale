import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SpecificationModel} from "../../../../models/product/specification.model";
import {ProductStorageService} from "../../../../services/product.storage.service";
import {DataService} from "../../../../services/data.service";

@Component({
  selector: 'app-specification-picklist',
  templateUrl: './specification-picklist.component.html',
  styleUrls: ['./specification-picklist.component.css']
})
export class SpecificationPicklistComponent implements OnInit {
  @Input() source: SpecificationModel[]
  @Input() target: SpecificationModel[]
  @Output() listChanged = new EventEmitter<{source:SpecificationModel[],target:SpecificationModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:SpecificationModel[],target:SpecificationModel[]}>()
  constructor(private storage: ProductStorageService, private dataService: DataService) {
    this.source = []
    this.target = []
  }

  ngOnInit(): void {
  }

  deleteSpecification(id:string){
    this.dataService.deleteSpecification(id).subscribe(res=>{
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

  editSpecification(id:string){
    // open a dialog where the user can edit this specification
    // inform the parent to rerender this component
    this.listChanged.emit({source:this.source,target:this.target})
  }

}
