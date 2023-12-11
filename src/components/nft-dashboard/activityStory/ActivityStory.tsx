import React, { useEffect, useMemo, useState } from 'react';
import { Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { ActivityStoryItem } from './ActivityStoryItem/ActivityStoryItem';
import * as S from './ActivityStory.styles';
import axios from "axios";
import {useAppSelector} from "@app/hooks/reduxHooks";
export const ActivityStory: React.FC = () => {
    const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);

  const { t } = useTranslation();

  const [walletLogs, setWalletLogs] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${smartWalletAddress}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`).then((res) => {
        const walletLogs = res.data.result
        const logs = walletLogs.map((log: any) => {
            if(log.topics[0] === '0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498') {
                console.log('log.topics[1]: ', parseInt(log.timeStamp, 16))
                return {
                    title: 'Initialized',
                    target: 0,
                    date: parseInt(log.timeStamp, 16)*1000,
                    status: 'success',
                    txHash: log.transactionHash,
                    image: 'https://2.bp.blogspot.com/-Dh7nG--VsSE/WGGZHu6Fr5I/AAAAAAAAQNI/ZDFa-2i-MVMLnCpKJRZsCNgfSNE6swdtQCLcB/s1600/create.png'
                }
            }
            if(log.topics[0] === '0x235bc17e7930760029e9f4d860a2a8089976de5b381cf8380fc11c1d88a11133') {
                const address = '0x' + log.topics[1].substring(26)
                return {
                    title: 'AdminUpdated',
                    target: address.substring(0, 6) + '...' + address.substring(address.length - 4),
                    date: parseInt(log.timeStamp, 16)*1000,
                    status: 'success',
                    txHash: log.transactionHash,
                    image: 'https://danangweb.vn/upload/images/web/admin.jpg'
                }
            }
            return {
                title: 'Unknown',
                target: 0,
                date: parseInt(log.timeStamp, 16)*1000,
                status: 'success',
                txHash: log.transactionHash,
                image: 'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg'
            }
        })
        console.log('logs: ', logs)
        setWalletLogs(logs)
    });
  }, []);

  const activityStory =
        walletLogs.map((item, index) => (
        <Col key={index} span={24}>
          <ActivityStoryItem {...item} />
        </Col>
      ))

  return (
    <S.Wrapper>
      <S.Title level={2}>Management actions</S.Title>
      <S.ActivityRow gutter={[26, 26]}>{activityStory}</S.ActivityRow>
    </S.Wrapper>
  );
};
