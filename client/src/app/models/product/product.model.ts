import {SpecificationModel} from "./specification.model";
import {OptionModel} from "./option.model";

export class ProductModel {
  constructor(public name: string|undefined, public cat: string|undefined,
              public price: number|undefined, public specifications: SpecificationModel[],
              public options: OptionModel[], public _id?: string) {

  }
}
