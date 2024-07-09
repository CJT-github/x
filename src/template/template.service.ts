import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import puppeteer from 'puppeteer';

@Injectable()
export class TemplateService {
  async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', // 沙盒模式
        '--disable-dev-shm-usage', // 创建临时文件共享内存
        '--disable-gpu', // GPU硬件加速
        '--test-type',
        '--disable-web-security', // 关闭chrome的同源策略
      ],
    });
    const page = await browser.newPage();
    try {
      // await page.goto('https://news.ycombinator.com', {
      //   waitUntil: 'networkidle2',
      // });

      // const pdf = await page.pdf({ path: 'hn.pdf', format: 'A4' });
      console.log('ww');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        path: 'firmware.pdf',
        format: 'A4',
        printBackground: true,
        timeout: 0,
      });
      return pdf;
    } catch (error) {
      console.log(error, 222);
      await browser.close();
      throw new HttpException('请求超时', HttpStatus.BAD_REQUEST);
    }
  }
}
