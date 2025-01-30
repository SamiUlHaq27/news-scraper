import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ArticleQuery } from 'src/api/interfaces/retreiveArticle.interface';
import { Query } from 'typeorm/driver/Query';


@Injectable()
export class QueryDatePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): ArticleQuery{

    if(!("query" in value)){
      throw new Error("'query:string' parameter is required in request query")
    }
    let articleQuery: ArticleQuery = {query:value.query}
    if(!value.date){
      return articleQuery;
    }
    if(/^\d{2,4}-\d{1,2}-\d{1,2}$/.test(value.date)){
      articleQuery.date = new Date(value.date)
      return articleQuery
    }
    throw new Error("Incorrect date format. Only digits are allowed with '-' b\\w in sequence of year-month-date")
  }
}
