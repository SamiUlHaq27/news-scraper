import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from "puppeteer"
import { Source } from '../entities/source.entity';
import { Article } from '../entities/article.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleQuery } from '../interfaces/retreiveArticle.interface';
import { ScrappingResults } from '../interfaces/scrappingResults.interface';


@Injectable()
export class ScrapperService {

    private sources = {fca:{
        root_url:"http://127.0.0.1:5500/News-search-results%20_%20FCA.html",
        // search_url: (query:string)=>`https://www.fca.org.uk/news/search-results?n_search_term=${query}`,
        search_url: (query:string)=>`http://localhost:5500/News%20search%20results%20_%20FCA%20with%20query.html`,
    }}

    constructor(
        @InjectRepository(Source) private sourceRepository:Repository<Source>,
        @InjectRepository(Article) private articleRepository:Repository<Article>
    ){}

    // To initiate scrapping process
    async startScrapping(){
        this.fcaNews(this.sources.fca.root_url)
    }

    // To fetch articles based on query
    async getArticles(articleQuery:ArticleQuery){
        var options: FindManyOptions<Article> 
        if(articleQuery.date){
            options = {where:[
                {title:Like(`%${articleQuery.query}%`), date_published:articleQuery.date},
                {content:Like(`%${articleQuery.query}%`), date_published:articleQuery.date}
            ]}
        } else {
            options = {where:[
                {title:Like(`%${articleQuery.query}%`)},
                {content:Like(`%${articleQuery.query}%`)}
            ]}
        }
        return await this.articleRepository.find(options)
    }

    // To delete articles based on query
    async deleteArticles(articleQuery:ArticleQuery): Promise<number>{
        let entities = await this.getArticles(articleQuery);
        return (await this.articleRepository.remove(entities)).length
    }

    // To scrap on query
    async scrapOnQuery(query:string): Promise<ScrappingResults>{
        return this.fcaNews(this.sources.fca.search_url(query))
    }
    // ----------------------------------- Scrapping Code --------------------------------------
    // To fetch list of articles from FCA
    private async fcaNews(url:string): Promise<ScrappingResults>{
        let scrappingResults: ScrappingResults = {
            total: 0,
            new: 0
        }
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
            if(await this.articleRepository.exists({where:{url:anchor[1]}})){
                scrappingResults.new++
            } else {
                let article: Article = this.articleRepository.create({
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
            scrappingResults.total++
        }
        this.sourceRepository.save(source)
        browser.close()
        return scrappingResults
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
