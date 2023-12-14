import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { RecentActivityHeader } from '@app/components/nft-dashboard/recentActivity/RecentActivityHeader/RecentActivityHeader';
import { RecentActivityFeed } from '@app/components/nft-dashboard/recentActivity/recentActivityFeed/RecentActivityFeed';
import { RecentActivityFilter } from '@app/components/nft-dashboard/recentActivity/recentActivityFilters/RecentActivityFilter';
import { useResponsive } from '@app/hooks/useResponsive';
import { Activity } from '@app/api/activity.api';
import * as S from './RecentActivity.styles';
import {anyNft, bmToken, freeToMintNft, getSmartWalletAddress, marketplace} from "@app/components/contract/smartWallet";
import {useAppSelector} from "@app/hooks/reduxHooks";
import {ethers} from "ethers";
import axios from "axios";

export interface RecentActivityFilterState {
  status: string[];
}

export const RecentActivity: React.FC = () => {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [filteredActivity, setFilteredActivity] = useState<Activity[]>([]);
  const [hasMore] = useState(false);

  const [histories, setHistories] = useState<Activity[]>([]);
  const [page, setPage] = useState(2);

  const [filters, setFilters] = useState<RecentActivityFilterState>({
    status: [],
  });

  const { isDesktop } = useResponsive();
  const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);


  useEffect(() => {
    getWalletLogs();
  }, []);

  const next = () => {

  };
  const getWalletLogs = async () => {
    const tokenLogs = await fetch(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${bmToken.address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic1=0x000000000000000000000000${smartWalletAddress.substring(2)}&topic1_2_opr=or&topic2=0x000000000000000000000000${smartWalletAddress.substring(2)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const tokenLogsData: Activity[] = (await tokenLogs.json()).result.map((log: any) => (
        {
          image: 'https://beincom.org/wp-content/uploads/2022/07/BIC.png',
          title: 'BM Token',
          status: 'transfer bic',
          amount: ethers.utils.formatEther(log.data),
          date: parseInt(log.timeStamp) * 1000,
          owner: '0x'+ log.topics[1].substring(26),
        }
    ));
    const free2mintLogs = await fetch(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${freeToMintNft.address}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic1=0x000000000000000000000000${smartWalletAddress.substring(2)}&topic1_2_opr=or&topic2=0x000000000000000000000000${smartWalletAddress.substring(2)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const free2mintLogsData: Activity[] = (await free2mintLogs.json()).result.map((log: any) => (
        {
          image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=beincom-test' + parseInt(log.topics[3].substring(0)),
          title: 'Free to mint NFT',
          status: 'transfer nft',
          date: parseInt(log.timeStamp) * 1000,
          owner: '0x'+ log.topics[1].substring(26),
          amount: 1,
        }
    ));
    console.log(free2mintLogsData);
    const collectionLogs = await fetch(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=0x5e5aba60b38b8D54Ce37c83dAc8a0F021bE367A9&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic1=0x000000000000000000000000${smartWalletAddress.substring(2)}&topic1_2_opr=or&topic2=0x000000000000000000000000${smartWalletAddress.substring(2)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const collectionLogsData: Activity[] = (await collectionLogs.json()).result.map(async (log: any) => {

      const nftContract = anyNft('0x5e5aba60b38b8D54Ce37c83dAc8a0F021bE367A9');
      const uri = await nftContract.tokenURI(parseInt(log.topics[3].substring(0)));
        const metadata = await axios.get(uri.replace('ipfs://', 'https://ipfs.io/ipfs/'))

        return {
                image: metadata.data.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                title: 'Collection',
                status: 'transfer nft',
                date: parseInt(log.timeStamp) * 1000,
                owner: '0x'+ log.topics[1].substring(26),
                amount: 1,
            }
    });
    const bidLogs = await fetch(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${marketplace.address}&topic0=0x433a278e1c55403e97ab8ffef6ce9fddd5d1fb2695745bbc3affbe0b8106ec6b&topic2=0x000000000000000000000000${smartWalletAddress.substring(2)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const bidLogsData: Activity[] = (await bidLogs.json()).result.map((log: any) => ({
        image: 'https://www.advancedpropertyauction.co.uk/assets/Uploads/gavel-bid.jpg',
        title: 'Bid',
        status: 'bid',
        date: parseInt(log.timeStamp) * 1000,
        owner: '0x'+ log.topics[1].substring(26),
        amount: 1,
    }));
    const data = tokenLogsData.concat(free2mintLogsData).concat(collectionLogsData).concat(bidLogsData).sort((a, b) => b.date - a.date);

    setHistories(data);
    setActivity(data)
    // setActivity(data.slice(0, 10));
  }

  useEffect(() => {
    if (filters.status.length > 0) {
      setFilteredActivity(activity.filter((item) => filters.status.some((filter) => filter === item.status)));
    } else {
      setFilteredActivity(activity);
    }
  }, [filters.status, activity]);

  return (
    <Row gutter={[30, 0]}>
      <Col span={24}>
        <RecentActivityHeader filters={filters} setFilters={setFilters} />
      </Col>

      <Col xs={24} sm={24} md={24} xl={16}>
        <RecentActivityFeed activity={filteredActivity} hasMore={hasMore} next={next} />
      </Col>

      {isDesktop && (
        <S.FilterCol span={8}>
          <RecentActivityFilter filters={filters} setFilters={setFilters} withWrapper />
        </S.FilterCol>
      )}
    </Row>
  );
};
