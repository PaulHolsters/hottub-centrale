import {OptionModel} from "../product/option.model";
import {QuotationSpecificationModel} from "./quotation-specification.model";
import {ProductModel} from "../product/product.model";

export class QuotationModel {
  constructor(public version: number,
              public product: ProductModel | undefined,
              public options: string[],
              public quotationSpecifications: QuotationSpecificationModel[],
              public customerInfo: { firstName: string | undefined; lastName: string | undefined; email: string | undefined; phoneNumber: string | undefined;
    street: string | undefined; houseNumber: string|undefined; postalCode: string | undefined; city: string | undefined; country: string | undefined},
              public VAT: number,
              public discount: number,
              public sendDate:Date[] | undefined,
              public sendDateStr: string[]|undefined,
              public creationDate: Date | undefined,
              public creationDateStr: string |undefined,
              public address: string | undefined,
              public deposit: number | undefined,
              public deliveryTime: string | undefined,
              public status?:string,
              public _id?: string) {
  }
}
