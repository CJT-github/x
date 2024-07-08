import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notes } from './entities/note.entity';
import { User } from 'src/user/entities/user.entity';
import { noteVo } from './vo/note.vo';
import { StatusNoteDto } from './dto/status-note.dto';
import { DeleteNoteDto } from './dto/delete-note.dto';

@Injectable()
export class NoteService {
  @InjectRepository(Notes)
  private noteRepository: Repository<Notes>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  //获取笔记列表
  async noteList(page: number, rows: number, userId: number) {
    //偏移量
    const skipCount = (page - 1) * rows;
    //根据用户ID查询出用户所属的笔记
    const [records, total] = await this.noteRepository.findAndCount({
      skip: skipCount,
      take: rows,
      where: { pid: userId },
    });

    return { records, total };
  }

  //保存笔记
  async saveNote(params: CreateNoteDto, userId: number, username: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['notes'],
      });
      const note = new Notes();
      note.pid = userId;
      note.title = params.title;
      note.content = params.content;
      note.category = params.category;
      note.tabs = params.tabs;
      note.headerImage = params.headerImage;
      note.collect = params.collect;
      note.desc = params.desc;
      note.byAdd = username;
      await this.noteRepository.save(note);
      user.notes = [...user.notes, note];
      await this.userRepository.save(user);
      return 'success';
    } catch (error) {
      throw new HttpException('添加失败', HttpStatus.BAD_REQUEST);
    }
  }

  //获取笔记详情
  async noteDetail(id: number) {
    const data = await this.noteRepository.findOne({ where: { id } });
    const note = new noteVo();
    note.title = data.title;
    note.content = data.content;
    note.category = data.category;
    note.tabs = data.tabs;
    note.headerImage = data.headerImage;
    note.collect = data.collect;
    note.desc = data.desc;
    return note;
  }

  //修改笔记
  async updateNote(params: UpdateNoteDto, userId: number) {
    const note = await this.noteRepository.findOneBy({ id: params.id });

    if (note.pid !== userId) {
      throw new UnauthorizedException('您没有权限执行该操作');
    }

    note.title = params.title;
    note.content = params.content;
    note.category = params.category;
    note.tabs = params.tabs;
    note.headerImage = params.headerImage;
    note.collect = params.collect;
    note.desc = params.desc;

    const data = await this.noteRepository.save(note);
    return data;
  }

  //修改笔记状态
  async updateStatus(params: StatusNoteDto, userId: number) {
    const note = await this.noteRepository.findOneBy({ id: params.id });

    if (note.pid !== userId) {
      throw new UnauthorizedException('您没有权限执行该操作');
    }
    note.status = Boolean(params.status);
    const data = await this.noteRepository.save(note);
    return data;
  }

  //修改笔记状态
  async deleteNote(params: DeleteNoteDto, userId: number) {
    const note = await this.noteRepository.findOneBy({ id: params.id });

    if (note.pid !== userId) {
      throw new UnauthorizedException('您没有权限执行该操作');
    }
    const data = await this.noteRepository.delete(note.id);
    return data;
  }
}
