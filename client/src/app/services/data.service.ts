import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {ProductModel} from "../models/product/product.model";
import {SpecificationModel} from "../models/product/specification.model";
import {OptionModel} from "../models/product/option.model";
import {QuotationSpecificationModel} from "../models/quotation/quotation-specification.model";
import {QuotationModel} from "../models/quotation/quotation.model";
import {QuotationGetModel} from "../models/quotation/quotation.get.model";

@Injectable()
export class DataService {

  constructor(private http: HttpClient) {
  }

  getProducts():Observable<ProductModel[]>{
    return this.http.get<{products:ProductModel[]}>('http://localhost:3000/products').pipe(map(result=>{
      return result.products
    }))
  }

  getQuotations():Observable<QuotationGetModel[]>{
    return this.http.get<{quotations:QuotationGetModel[]}>('http://localhost:3000/quotations').pipe(map(result=>{
      const latestVersionQuotations = result.quotations.filter(quotGet=>{
        const filteredQuotGets = result.quotations.filter(quotGetGroupId=>{
          return quotGetGroupId.groupId === quotGet.groupId

        })
        return filteredQuotGets.every(quot => quot.version <= quotGet.version)
      }).sort((a,b)=>{
        if(a.creationDate>b.creationDate){
          return -1
        } else if(a.creationDate==b.creationDate){
          return 0
        } else return 1
      })
      latestVersionQuotations.forEach(q=>{
        q.customer = q.customerInfo.firstName + ' ' + q.customerInfo.lastName
        q.totalPrice = this.totalPrice(q._id,result.quotations)
        console.log(q.sendDate)
      })
      return latestVersionQuotations
    }))
  }

  totalPrice(id:string,quots:QuotationGetModel[]):number|undefined{
    const quot = quots.find(quot=>{return quot._id===id})
    if(quot){
      const productPrice = quot.quotationValues.productPrice
      const options = quot.quotationValues.optionValues.map(val=>{
        return val.price||0
      })
      let optionsPrice = 0
      let quotSpecsPrice = 0
      if(options.length>0){
        optionsPrice = options.reduce((x,y)=>(x+y))
      }
      const quotSpecs = quot.quotationValues.quotationSpecificationValues.map(quotspec=>{
        return quotspec.price||0
      })
      if(quotSpecs.length>0){
        quotSpecsPrice = quotSpecs.reduce((x,y)=>(x+y))
      }
      const subTotal = productPrice+optionsPrice+quotSpecsPrice
      return subTotal-(quot.discount*subTotal/100)
    }
    return undefined
  }

  getProduct(id:string):Observable<ProductModel>{
    return this.http.get<{product:ProductModel}>('http://localhost:3000/products/'+id).pipe(map(result=>{
      return result.product
    }))
  }

  getQuotation(id:string):Observable<QuotationGetModel>{
    return this.http.get<{quotation:QuotationGetModel}>('http://localhost:3000/quotations/'+id).pipe(map(result=>{
      return result.quotation
    }))
  }

  getSpecifications():Observable<SpecificationModel[]>{
    return this.http.get<{specifications:SpecificationModel[]}>('http://localhost:3000/product-specifications').pipe(map(res=>{
      return res.specifications
    }))
  }

  getOptions():Observable<OptionModel[]>{
    return this.http.get<{options:OptionModel[]}>('http://localhost:3000/product-options').pipe(map(res=>{
      return res.options
    }))
  }

  getQuotationSpecifications():Observable<QuotationSpecificationModel[]>{
    return this.http.get<{quotationSpecifications:QuotationSpecificationModel[]}>('http://localhost:3000/quotation-specifications').pipe(map(res=>{
      return res.quotationSpecifications
    }))
  }

  createProduct(product:ProductModel):Observable<any>{
    return this.http.post('http://localhost:3000/products',product).pipe(map((err,res)=>{
      return res
    }))
  }

  createQuotation(quotation:QuotationModel):Observable<any>{
    if(quotation.customerInfo.firstName && quotation.customerInfo.firstName?.trim()[0]!==quotation.customerInfo.firstName?.trim()[0].toUpperCase()){
      quotation.customerInfo.firstName = quotation.customerInfo.firstName?.trim()[0].toUpperCase() + quotation.customerInfo.firstName?.trim().substr(1)
    } else{
      throwError('bad customerInfo')
    }
    const quotationObj = {
      version: quotation.version,
      productId: quotation?.product?._id,
      selectedOptions: quotation.options,
      selectedQuotationSpecifications: quotation?.quotationSpecifications?.map(quot=>{
        return quot._id
      }),
      customerInfo: {...quotation.customerInfo},
      VAT: quotation.VAT,
      discount: quotation.discount
    }
    return this.http.post('http://localhost:3000/quotations',quotationObj).pipe(map((err,res)=>{
      return res
    }))
  }

  editQuotation(quotation:QuotationGetModel):Observable<any>{
    return this.http.put('http://localhost:3000/quotations/'+quotation.groupId+'/'+quotation.previousVersionId,quotation)
        .pipe(map((err,res)=>{
      console.log(err,res)
      return res
    },catchError(err=>{
      console.log(err)
      return new Observable(err)
        })))
  }

  editStatusQuotation(id:string,status:string):Observable<any>{
    switch (status){
      case 'approved':
        status = 'goedgekeurd'
        break
      case 'to be altered':
        status = 'aan te passen'
        break
      case 'cancelled':
        status = 'geannuleerd'
        break
      default:
        return new Observable()
    }
    const statusObj = {status:status}
    return this.http.patch('http://localhost:3000/quotations/'+id,statusObj)
        .pipe(map((res,status)=>{
          return status
        },catchError(err=>{
          console.log(err)
          return new Observable(err)
        })))
  }

  downloadQuotation(id:string):Observable<any>{
    return this.http.get('http://localhost:3000/quotations/action/'+id+'?action=pdf',{
responseType:"blob"
    }).pipe(map((res)=>{
      console.log(res)
      return res
    }),catchError(err=>{
      return throwError(err)
    }))
  }

  sendQuotation(id:string):Observable<any>{
    return this.http.get('http://localhost:3000/quotations/action/'+id+'?action=mail').pipe(map((res)=>{
      return res
    }),catchError(err=>{
      return throwError(err)
    }))
  }

  deleteQuotation(id:string):Observable<any>{
    return this.http.delete('http://localhost:3000/quotations/'+id).pipe(map((res)=>{
      return res
    }),catchError(err=>{
      return throwError(err)
    }))
  }

  createSpecification(specification:SpecificationModel):Observable<SpecificationModel>{
    return this.http.post<{specification:SpecificationModel}>('http://localhost:3000/product-specifications',specification).pipe(map(res=>{
      return res.specification
    }))
  }

  createOption(option:OptionModel):Observable<OptionModel>{
    return this.http.post<{option:OptionModel}>('http://localhost:3000/product-options',option).pipe(map(res=>{
      return res.option
    }))
  }

  createQuotationSpecification(quotationSpecification:QuotationSpecificationModel):Observable<QuotationSpecificationModel>{
    return this.http.post<{quotationSpecification:QuotationSpecificationModel}>('http://localhost:3000/quotation-specifications',quotationSpecification)
      .pipe(map(res=>{
      return res.quotationSpecification
    }))
  }

  editProduct(product:ProductModel):Observable<any>{
    return this.http.put('http://localhost:3000/products/'+product._id,product).pipe(map(res=>{
      return res
    }))
  }

  editSpecification(spec:SpecificationModel):Observable<any>{
    return this.http.patch('http://localhost:3000/product-specifications/'+spec._id,spec).pipe(map(res=>{
      return res
    }))
  }

  editOption(opt:OptionModel):Observable<any>{
    return this.http.put('http://localhost:3000/product-options/'+opt._id,opt).pipe(map(res=>{
      return res
    }))
  }

  editQuotationSpecification(quotSpec:QuotationSpecificationModel):Observable<any>{
    return this.http.put('http://localhost:3000/quotation-specifications/'+quotSpec._id,quotSpec).pipe(map(res=>{
      return res
    }))
  }

  deleteSpecification(id:string):Observable<any>{
    return this.http.delete('http://localhost:3000/product-specifications/'+id).pipe(map(res=>{
      return res
    }))
  }

  deleteOption(id:string):Observable<any>{
    return this.http.delete('http://localhost:3000/product-options/'+id).pipe(map(res=>{
      return res
    }))
  }

  deleteQuotationSpecification(id:string):Observable<any>{
    return this.http.delete('http://localhost:3000/quotation-specifications/'+id).pipe(map(res=>{
      return res
    }))
  }

  deleteProduct(id:string):Observable<any>{
    return this.http.delete('http://localhost:3000/products/'+id).pipe(map(res=>{
      return res
    }))
  }

}
