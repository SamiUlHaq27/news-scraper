import { Entity, Column, PrimaryGeneratedColumn, Timestamp, ManyToOne } from 'typeorm';
import { Source } from './source.entity';


@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:false})
  title: string;

  @Column({type:'text', nullable:false, unique:true})
  url: string;
  
  @Column({type:'text', nullable:false})
  media_url: string;

  @Column({type:'text', nullable:false})
  content: string;
  
  @Column({type:'date', nullable:false})
  date_published: Date;
  
  @Column({type:'timestamp', default:() => "CURRENT_TIMESTAMP"})
  scraped_at: Timestamp;
  
  @ManyToOne(()=>Source, (Source)=>Source.articles)
  source_id: Source;
}