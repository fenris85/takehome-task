import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('should return gas balance', async () => {
    expect(await appService.getGasBalance()).toBeTruthy();
  });

  it('should return usdt0 balance', async () => {
    expect(await appService.getUsdt0Balance()).toBeTruthy();
  });

  it('should return usdt0 trades', async () => {
    expect(await appService.getUsdt0Trades()).toBeTruthy();
  });
});
