import {Injectable} from "@angular/core";


@Injectable()
export class SharedFunctionService{

    dateToString(date:Date):string{
        console.log(date,typeof date)
        return Intl.DateTimeFormat('en-GB').format(date)
    }

}
