import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper/scrapper.service';
import { ApiController } from './api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './entities/source.entity';
import { Article } from './entities/article.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Source, Article])],
  providers: [ScrapperService],
  controllers: [ApiController]
})
export class ApiModule {}
