import { timestamp } from 'rxjs';
import { Entity, Column, PrimaryGeneratedColumn, Timestamp, OneToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class Source {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'varchar', length:255, nullable:false})
  name: string;

  @Column({type:'text', nullable:false, unique:true})
  url: string;

  @Column({type:'timestamp', default:() => "CURRENT_TIMESTAMP"})
  created_at: Timestamp;

  @OneToMany(()=>Article, (Article)=>Article.source_id, {cascade:true})
  articles: Array<Article>
}