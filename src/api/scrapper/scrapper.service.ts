import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from "puppeteer"
import { Source } from '../entities/source.entity';
import { Article } from '../entities/article.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ScrapperService {

    constructor(
        @InjectRepository(Source) private sourceRepository:Repository<Source>,
        @InjectRepository(Article) private articleRepository:Repository<Article>
    ){}

    // To initiate scrapping process
    async startScrapping(){
        this.fcaNews()
    }

    async getArticles(options:FindManyOptions<Article> = {}){
        return await this.articleRepository.find(options)
    }

    // To fetch list of articles from FCA
    private async fcaNews() {
        
        let url:string = "http://127.0.0.1:5500/News-search-results%20_%20FCA.html"

        // Starting a headless browser and navigating to the url
        let browser:Browser = await puppeteer.launch()
        let page:Page = await browser.newPage()
        await page.goto(url)
        
        // Getting or creating new source entity
        var source: Source = await await this.sourceRepository.findOneBy({name:"fca"}) ?? this.sourceRepository.create({
            name: "fca",
            url: url,
            articles: new Array<Article>()
        })
        
        // Collecting and cleaning data from the webpage
        let list = await (await page.$(".search-list"))?.$$(".search-item") ?? []
        for (const element of list) {
            let anchor = await element.$eval("a", t => [t.innerText, t.href])
            // Format of scrapped date "Published: DD/MM/YYYY"
            let date_pub:Array<string> = ((await element.$eval(".published-date", p => p.innerHTML)).slice(11)).split("/")
            // getting or creating a new article entity
            let article: Article = await this.articleRepository.findOne({where:{url:anchor[1]}}) ?? this.articleRepository.create({
                title: anchor[0],
                url: anchor[1],
                date_published: new Date(parseInt(date_pub[2]), parseInt(date_pub[1])-1, parseInt(date_pub[0])+1),
                content: await this.fcaContent(anchor[1]),
                source_id: source
            })
            if(source.articles){
                source.articles.push(article)
            } else {
                source.articles = new Array<Article>(article)
            }
        }
        this.sourceRepository.save(source)
        browser.close()

    }
    
    // To fetch content of FCA articles
    private async fcaContent(url:string): Promise<string>{
        let browser:Browser = await puppeteer.launch()
        let page:Page = await browser.newPage()
        await page.goto(url)
    
        let section = (await page?.$$("article section")).at(1)
        let content:string = await section?.$eval(".container", (c)=>c.textContent) ?? "";
        
        browser.close()
        return content
    }
    
}
