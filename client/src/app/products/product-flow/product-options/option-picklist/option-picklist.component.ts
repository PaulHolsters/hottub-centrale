import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProductStorageService} from "../../../../services/product.storage.service";
import {DataService} from "../../../../services/data.service";
import {OptionModel} from "../../../../models/product/option.model";

@Component({
  selector: 'app-option-picklist',
  templateUrl: './option-picklist.component.html',
  styleUrls: ['./option-picklist.component.css']
})
export class OptionPicklistComponent implements OnInit {
  @Input() source: OptionModel[]
  @Input() target: OptionModel[]
  @Output() listChanged = new EventEmitter<{source:OptionModel[],target:OptionModel[]}>()
  @Output('store') storeEvent = new EventEmitter<{source:OptionModel[],target:OptionModel[]}>()
  constructor(private storage: ProductStorageService, private dataService: DataService) {
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
