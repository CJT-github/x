import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  SetMetadata,
  Inject,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { generateParseIntPipe } from 'src/utils';
import { AuthToken } from 'src/auth-token.decorator';
import { JwtService } from '@nestjs/jwt';
import { StatusNoteDto } from './dto/status-note.dto';
import { DeleteNoteDto } from './dto/delete-note.dto';

@Controller('api/note')
export class NoteController {
  @Inject(JwtService)
  private jwtService: JwtService;

  constructor(private readonly noteService: NoteService) {}

  //笔记列表
  @SetMetadata('require-login', true)
  @Get('noteList')
  async noteList(
    @AuthToken() token: string,
    @Query('page', new DefaultValuePipe(1), generateParseIntPipe('page'))
    page: number,
    @Query('rows', new DefaultValuePipe(20), generateParseIntPipe('rows'))
    rows: number,
  ) {
    const authToken = token.split(' ')[1];
    const { userId } = this.jwtService.verify(authToken);
    const data = await this.noteService.noteList(page, rows, userId);
    return data;
  }

  //获取笔记详情
  @SetMetadata('require-login', true)
  @Get('noteDetail')
  async noteDetail(
    @Query(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          throw new BadRequestException('id 应该是数字');
        },
      }),
    )
    id: number,
  ) {
    return await this.noteService.noteDetail(id);
  }

  //保存笔记
  @SetMetadata('require-login', true)
  @Post('saveNote')
  async saveNote(
    @Body(new ValidationPipe()) params: CreateNoteDto,
    @AuthToken() token: string,
  ) {
    const authToken = token.split(' ')[1];
    const { userId, username } = this.jwtService.verify(authToken);
    const data = await this.noteService.saveNote(params, userId, username);
    return data;
  }

  //修改笔记状态
  @SetMetadata('require-login', true)
  @Post('updateStatus')
  async updateStatus(
    @Body(new ValidationPipe()) params: StatusNoteDto,
    @AuthToken() token: string,
  ) {
    const authToken = token.split(' ')[1];
    const { userId } = this.jwtService.verify(authToken);
    const data = await this.noteService.updateStatus(params, userId);
    return data;
  }

  //修改笔记
  @SetMetadata('require-login', true)
  @Post('updateNote')
  async updateNote(
    @Body(new ValidationPipe()) params: UpdateNoteDto,
    @AuthToken() token: string,
  ) {
    const authToken = token.split(' ')[1];
    const { userId } = this.jwtService.verify(authToken);
    const data = await this.noteService.updateNote(params, userId);
    return data;
  }

  //删除笔记
  @SetMetadata('require-login', true)
  @Post('deleteNote')
  async deleteNote(
    @Body(new ValidationPipe()) params: DeleteNoteDto,
    @AuthToken() token: string,
  ) {
    const authToken = token.split(' ')[1];
    const { userId } = this.jwtService.verify(authToken);
    const data = await this.noteService.deleteNote(params, userId);
    return data;
  }
}
