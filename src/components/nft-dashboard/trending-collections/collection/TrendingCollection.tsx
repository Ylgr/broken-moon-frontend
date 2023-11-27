import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@app/components/common/Avatar/Avatar';
import { formatNumberWithCommas, getCurrencyPrice } from '@app/utils/utils';
import { ActionInfo } from '@app/api/activity.api';
import * as S from './TrendingCollection.styles';
import {ethers} from "ethers";

export const TrendingCollection: React.FC<ActionInfo> = ({ name, auctionCreator, minimumBidAmount, buyoutBidAmount, image, avatar }) => {
  const { t } = useTranslation();
    console.log('TrendingCollection: ', {name, auctionCreator, minimumBidAmount, image, avatar})
  return (
    <S.Card padding={0} $img={image}>
      <S.CollectionImage src={image} alt="nft" />
      <S.BidButton type="ghost">{t('nft.bid')}</S.BidButton>
      <S.NftCollectionInfo>
        <S.AuthorAvatarWrapper>
          <Avatar shape="circle" size={64} src={avatar} alt={auctionCreator} />
        </S.AuthorAvatarWrapper>
        <S.InfoRow>
          <S.Title level={5}>{name}</S.Title>
        </S.InfoRow>
        <S.InfoRow>
          <S.OwnerText>
            {t('nft.by')} {auctionCreator.substring(0, 4) + '...' + auctionCreator.substring(auctionCreator.length - 4)}
          </S.OwnerText>
          <S.USDText>{getCurrencyPrice(formatNumberWithCommas(parseInt(ethers.utils.formatEther(minimumBidAmount))), 'BM')}</S.USDText>
          <S.USDText>{getCurrencyPrice(formatNumberWithCommas(parseInt(ethers.utils.formatEther(buyoutBidAmount))), 'BM')}</S.USDText>
        </S.InfoRow>
      </S.NftCollectionInfo>
    </S.Card>
  );
};
