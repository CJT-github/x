import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import puppeteer from 'puppeteer';

@Injectable()
export class TemplateService {
  async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto('https://news.ycombinator.com', {
        waitUntil: 'networkidle2',
      });
      const pdf = await page.pdf({ path: 'hn.pdf', format: 'A4' });
      return pdf;
    } catch (error) {
      console.log(error);
      await browser.close();
    }

    // await page.setContent(html, { waitUntil: 'networkidle0' });

    // const pdf = await page.pdf({ format: 'A4', printBackground: true });
  }
}
