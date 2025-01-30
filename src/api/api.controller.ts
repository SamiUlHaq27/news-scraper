import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ScrapperService } from './scrapper/scrapper.service';
import { QueryDatePipe } from './pipes/query-date/query-date.pipe';
import { ArticleQuery } from './dto/retreiveArticle.dto';

@Controller('api')
export class ApiController {

    constructor(private scrapperService: ScrapperService){}

    // inititiating scrapping process
    @Get()
    async startScraping(){
        this.scrapperService.startScrapping()
        return {
            message:"Scrapping started"
        }
    }

    // retreiving articles based on query
    @Post()
    async getArticles(@Query(new QueryDatePipe()) articleQuery:ArticleQuery){
        return await this.scrapperService.getArticles(articleQuery)
    }
}
