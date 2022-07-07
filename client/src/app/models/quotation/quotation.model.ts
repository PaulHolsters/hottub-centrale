import {OptionModel} from "../product/option.model";
import {QuotationSpecificationModel} from "./quotation-specification.model";
import {ProductModel} from "../product/product.model";

export class QuotationModel {
  constructor(public version: number,
              public product: ProductModel | undefined,
              public options: string[],
              public quotationSpecifications: QuotationSpecificationModel[],
              public customerInfo: { firstName: string | undefined; lastName: string | undefined; email: string | undefined },
              public VAT: number,
              public discount: number,
              public sendDate:string[] | undefined,
              public creationDate: Date | undefined,
              public active: boolean,
              public status?:string,
              public _id?: string) {
  }
}
