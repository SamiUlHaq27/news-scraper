import { Controller, Get, Post } from '@nestjs/common';
import { ScrapperService } from './scrapper/scrapper.service';

@Controller('api')
export class ApiController {

    constructor(private scrapperService: ScrapperService){}

    @Get()
    async startScraping(){
        this.scrapperService.startScrapping()
        return {
            message:"Scrapping started"
        }
    }

    @Post()
    async getArticles(){
        console.log('/api [POST]');
        
        return await this.scrapperService.getArticles()
    }
}
