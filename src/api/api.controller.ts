import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ScrapperService } from './scrapper/scrapper.service';
import { QueryDatePipe } from './pipes/query-date/query-date.pipe';
import { ArticleQuery } from './interfaces/retreiveArticle.interface';
import { ScrappingResults } from './interfaces/scrappingResults.interface';

@Controller('api')
export class ApiController {

    constructor(private scrapperService: ScrapperService){}

    // inititiating scrapping process
    @Post("scrape")
    async startScraping(){
        this.scrapperService.startScrapping()
        return {
            message:"Scrapping started"
        }
    }

    // retreiving articles based on query
    @Get("articles")
    async getArticles(@Query(new QueryDatePipe()) articleQuery:ArticleQuery){
        return await this.scrapperService.getArticles(articleQuery)
    }

    // deleting artilces based on query
    @Delete("articles")
    async deleteArticles(@Query(new QueryDatePipe()) articleQuery:ArticleQuery){
        let n:number = await this.scrapperService.deleteArticles(articleQuery)
        return {
            "status": "success",
            "message": "Articles deleted",
            "deleted_count": n
        }
    }

    // scrap on query
    @Post("scrape-query")
    async queryScrapping(@Query("query") query:string){
        let res: ScrappingResults = await this.scrapperService.scrapOnQuery(query)
        return {
            "status": "success",
            "message": "Query scraping completed",
            "results": {
                "query": query,
                "total_articles": res.total,
                "new_articles": res.new
            }
        }
    }
}
