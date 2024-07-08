import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import puppeteer from 'puppeteer';
import { Job } from './entities/job.entity';
import { EntityManager } from 'typeorm';
import { JobUser } from './entities/user-job.entity';

@Injectable()
export class JobService {
  @Inject(EntityManager)
  private entityManager: EntityManager;

  //爬虫
  async startSpider(quey: string, userId: number) {
    //获取表数据
    const _jobData = await this.entityManager.findBy(JobUser, {
      userId,
    });
    //清空数据再重新拉取
    if (_jobData) {
      await this.entityManager.remove(JobUser, _jobData);
    }

    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 0, height: 0 },
      });

      const page = await browser.newPage();

      await page.goto(`https://www.zhipin.com/web/geek/job?${quey}`);

      await page.waitForSelector('.job-list-box');

      const totalPage = await page.$eval(
        '.options-pages a:nth-last-child(2)',
        (e) => {
          return parseInt(e.textContent);
        },
      );

      const allJobs = [];

      for (let i = 1; i <= totalPage; i++) {
        await page.goto(
          `https://www.zhipin.com/web/geek/job?${quey}&page=${i}`,
        );
        await page.waitForSelector('.job-list-box');

        const jobs = await page.$eval('.job-list-box', (el) => {
          return [...el.querySelectorAll('.job-card-wrapper')].map((item) => {
            return {
              job: {
                name: item.querySelector('.job-name').textContent,
                area: item.querySelector('.job-area').textContent,
                salary: item.querySelector('.salary').textContent,
              },
              link: item.querySelector('a').href,
              company: {
                name: item.querySelector('.company-name').textContent,
              },
            };
          });
        });
        allJobs.push(...jobs);
      }
      const _JobUser = new JobUser();
      _JobUser.userId = userId;

      let _userJob: Array<Job> = [];

      for (let i = 0; i < allJobs.length; i++) {
        await page.goto(allJobs[i].link);
        await page.waitForSelector('.job-sec-text');
        const jd = await page.$eval('.job-sec-text', (el) => {
          return el.textContent;
        });
        allJobs[i].desc = jd;

        const job = new Job();

        job.name = allJobs[i].job.name;
        job.area = allJobs[i].job.area;
        job.salary = allJobs[i].job.salary;
        job.link = allJobs[i].link;
        job.company = allJobs[i].company.name;
        job.desc = allJobs[i].desc;
        _userJob.push(job);
        await this.entityManager.save(Job, job);
        _JobUser.job = _userJob;
        await this.entityManager.save(JobUser, _JobUser);
      }

      return 'success';
    } catch (error) {
      // await this.entityManager.remove(JobUser, _jobData);
      // throw new HttpException('爬取失败，已中断爬取', HttpStatus.BAD_REQUEST);
      console.log(error);
    }
  }

  //获取列表
  async spiderList() {
    return this.entityManager.find(Job);
  }
}
