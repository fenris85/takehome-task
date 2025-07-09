import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { hyperEvm } from './utils/hyperevm';
import { createPublicClient, erc20Abi, http } from 'viem';

const USTD0_ADDRESS = '0xaa480c5f5eb436d0645189ca20e5ade13aecaf27';
const USER_ADDRESS = '0xde7D4ca820d141d655420D959AfFa3920bb1E07A';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.indexUsdt0Transfers();
  }

  async indexUsdt0Transfers() {
    const client = createPublicClient({
      chain: hyperEvm,
      transport: http(),
    });

    const transferEvent = erc20Abi.find(
      (abi) => abi.type === 'event' && abi.name === 'Transfer',
    )!;

    // FIXME: query exceeds max block range 1000
    const logs = await client.getLogs({
      address: USTD0_ADDRESS,
      event: transferEvent,
      args: { from: USER_ADDRESS, to: null },
      fromBlock: 5350082n, // USDT0 inception block
    });

    console.log(logs);
  }

  async getGasBalance() {
    // TODO
  }

  async getUsdt0Balance() {
    // TODO
  }

  async getUsdt0Trades() {
    // TODO
  }
}
