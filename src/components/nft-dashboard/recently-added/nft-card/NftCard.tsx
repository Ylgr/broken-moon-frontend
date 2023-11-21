import React, {useEffect, useState} from 'react';
import { useResponsive } from '@app/hooks/useResponsive';
import { NftItem } from '@app/api/nftDashboard.api';
import { formatNumberWithCommas, getCurrencyPrice } from '@app/utils/utils';
import * as S from './NftCard.styles';
import {Button} from "@app/components/common/buttons/Button/Button";
import {Modal} from "@app/components/common/Modal/Modal";
import {provider, treasuryInterface} from "@app/components/contract/smartWallet";
import {Dropdown} from "@app/components/common/Dropdown/Dropdown";
import {DownOutlined} from "@ant-design/icons";
import {Menu, MenuItem} from "@app/components/common/Menu/Menu";

interface NftCardProps {
  nftItem: NftItem;
}

export const NftCard: React.FC<NftCardProps> = ({ nftItem }) => {
  const { isTablet } = useResponsive();
  const primeTransactions = [
      "0x3309ab35d8967a732c377012654df33e9557ae83254be1ff5998721b7d9662be"
  ]
    const [primeInfo, setPrimeInfo] = useState<any>([]);

    const basicMenu = (
        <Menu>
            <MenuItem>
                <Button type="link" target="_blank" href="https://testnet.bscscan.com/tx/0x3309ab35d8967a732c377012654df33e9557ae83254be1ff5998721b7d9662be">
                    Got 10,000,000 BIC AA
                </Button>
            </MenuItem>
        </Menu>
    );

  const tabletLayout = (
    <>
      <S.InfoHeader>
        <S.InfoText>@{nftItem.description}</S.InfoText>
      </S.InfoHeader>

      {/*<S.InfoFooter>*/}
      {/*  <S.CurrentBidWrapper>*/}
      {/*    <S.CurrentBid>Current Bid</S.CurrentBid>*/}
      {/*    <S.BidCrypto>{getCurrencyPrice(formatNumberWithCommas(nftItem.currentBidCrypto), 'ETH', false)}</S.BidCrypto>*/}
      {/*  </S.CurrentBidWrapper>*/}

      {/*  <S.CurrentBidWrapper>*/}
      {/*    <S.Bid>{getCurrencyPrice(formatNumberWithCommas(nftItem.currentBid), 'USD')}</S.Bid>*/}
      {/*  </S.CurrentBidWrapper>*/}
        {/*</S.InfoFooter>*/}
        <S.InfoFooter>

            <Dropdown overlay={basicMenu}>
                <Button severity="info" onClick={() => {
                    // setIsShowPrimeModalVisible(true)
                }}>Show PRIME</Button>
            </Dropdown>
        </S.InfoFooter>
    </>
  );
  const mobileLayout = (
    <>
      {/*<S.InfoRow>*/}
      {/*  <S.InfoText>@{nftItem.name}</S.InfoText>*/}
      {/*  <S.BidCrypto>{getCurrencyPrice(formatNumberWithCommas(nftItem.currentBidCrypto), 'ETH', false)}</S.BidCrypto>*/}
      {/*</S.InfoRow>*/}

      {/*<S.InfoRow>*/}
      {/*  <S.CurrentBid>Current Bid</S.CurrentBid>*/}
      {/*  <S.Bid>{getCurrencyPrice(formatNumberWithCommas(nftItem.currentBid), 'USD')}</S.Bid>*/}
      {/*</S.InfoRow>*/}
    </>
  );

  return (
    <S.Card padding={0} $img={nftItem.image}>
      <S.NftImage src={nftItem.image} alt="nftImage" />
      <S.NftInfo>
        <S.InfoRow>
          <S.Title>{nftItem.name}</S.Title>
        </S.InfoRow>
        {isTablet ? tabletLayout : mobileLayout}
      </S.NftInfo>
    </S.Card>
  );
};
