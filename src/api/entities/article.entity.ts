import { Entity, Column, PrimaryGeneratedColumn, Timestamp, ManyToOne } from 'typeorm';
import { Source } from './source.entity';


@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'text'})
  title: string;

  @Column({type:'text', unique:true})
  url: string;
  
  @Column({type:'text', nullable:true})
  media_url: string;

  @Column({type:'text', nullable:true})
  content: string;
  
  @Column({type:'date'})
  date_published: Date;
  
  @Column({type:'timestamp', default:() => "CURRENT_TIMESTAMP"})
  scraped_at: Timestamp;
  
  @ManyToOne(()=>Source, (Source)=>Source.articles)
  source_id: Source;
}