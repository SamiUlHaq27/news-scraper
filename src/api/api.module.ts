import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper/scrapper.service';

@Module({
  providers: [ScrapperService]
})
export class ApiModule {}
