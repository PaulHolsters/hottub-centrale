import {Pipe, PipeTransform} from "@angular/core";

@Pipe(
  {name: 'capitalizeFirst'}
)
export class CapitalizeFirst implements PipeTransform{
  transform(value: string): any {
    return value.substr(0,1).toUpperCase()+value.substr(1)
  }

}
