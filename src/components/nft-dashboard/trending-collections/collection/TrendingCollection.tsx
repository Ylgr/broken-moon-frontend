import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@app/components/common/Avatar/Avatar';
import { formatNumberWithCommas, getCurrencyPrice } from '@app/utils/utils';
import { ActionInfo } from '@app/api/activity.api';
import * as S from './TrendingCollection.styles';
import {ethers} from "ethers";
import {Modal} from "@app/components/common/Modal/Modal";
import {Input} from "@app/components/common/inputs/Input/Input";
import {Button} from "@app/components/common/buttons/Button/Button";
import * as dayjs from 'dayjs'
import {bicAccountInterface, bmToken, marketplace} from "@app/components/contract/smartWallet";
import {useAppSelector} from "@app/hooks/reduxHooks";
import {useDispatch} from "react-redux";
import {setOps, setOpsDetails} from "@app/store/slices/walletSlice";
export const TrendingCollection: React.FC<ActionInfo> = ({ name, auctionCreator, minimumBidAmount, buyoutBidAmount, image, avatar, auctionId, startTimestamp, endTimestamp, bidBufferBps }) => {
  const { t } = useTranslation();
  const [isBid, setIsBid] = React.useState(false);
    const [bidAmount, setBidAmount] = React.useState(minimumBidAmount);
    const [winningBid, setWinningBid] = React.useState({_bidder: ethers.constants.AddressZero, _currency: ethers.constants.AddressZero, _bidAmount: 0});
  const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);
  const ops = useAppSelector((state) => state.wallet.ops);
  const dispatch = useDispatch();
  const transactionExecuted = useAppSelector((state) => state.wallet.transactionExecuted);
  const opsDetails = useAppSelector((state) => state.wallet.opsDetails);
  useEffect(() => {
        marketplace.getWinningBid(auctionId).then((winningBid: any) => {
            setWinningBid(winningBid);
        });
  }, [transactionExecuted]);

    const createBidOps = async () => {
      const newOps = [];
      const newOpsDetails = [];
      if(await bmToken.allowance(smartWalletAddress, marketplace.address) < bidAmount) {
        const initApproveCallData = bmToken.interface.encodeFunctionData("approve", [marketplace.address, ethers.constants.MaxUint256]);
        const callApproveDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bmToken.address, ethers.constants.HashZero, initApproveCallData]);
        newOps.push({callData: callApproveDataForEntrypoint});
        newOpsDetails.push({
          actionName: 'create bid',
          actionStep: 'approve',
          asset: 'BIC',
          amount: 'MaxUint256',
          toAddress: marketplace.address,
          note: 'only need one time'
        });
      }
        const initBidCallData = marketplace.interface.encodeFunctionData("bidInAuction", [auctionId, bidAmount]);
        const callBidDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [marketplace.address, ethers.constants.HashZero, initBidCallData]);
        newOps.push({callData: callBidDataForEntrypoint});
        newOpsDetails.push({
          actionName: 'create bid',
          actionStep: 'bid',
          asset: 'BIC',
          amount: ethers.utils.formatEther(bidAmount),
          toAddress: marketplace.address,
          note: ''
        });
        dispatch(setOps([...(ops || []), ...newOps]));
        dispatch(setOpsDetails([...opsDetails, ...newOpsDetails]));
    }

  return (
      <div>
      {isBid ? (
          <S.Card padding={0} $img={image}>
            <S.InfoRow>
              <S.Title level={5}>{name}</S.Title>
            </S.InfoRow>
            <p>Start time: {dayjs.unix(parseInt(startTimestamp.toString())).format()}</p>
            <p>End time: {dayjs.unix(parseInt(endTimestamp.toString())).format()}</p>
            <p>Current winning bid: {winningBid._bidder.substring(0, 4) + '...' + winningBid._bidder.substring(winningBid._bidder.length - 4)}</p>
            <p>Current winning bid amount: {parseInt(ethers.utils.formatEther(winningBid._bidAmount))}</p>
            <p>Bid amount (step {parseInt(bidBufferBps.toString()) / 10_000}%): </p>
            <Input type="number" value={parseInt(ethers.utils.formatEther(bidAmount))} onChange={(event) => {
              if(event.target.value == '') {
                setBidAmount(ethers.utils.parseEther('0').toBigInt())
              } else {
                setBidAmount(ethers.utils.parseEther(event.target.value).toBigInt())
              }
            }}/>
            <Button onClick={() => {
              createBidOps();
              setIsBid(false)
            }}>{t('nft.bid')}</Button>
            <Button onClick={() => setIsBid(false)}>Cancel</Button>
          </S.Card>
      ) : (
          <S.Card padding={0} $img={image}>
            <S.CollectionImage src={image} alt="nft" />
            <S.BidButton type="ghost" onClick={() => setIsBid(true)}>{t('nft.bid')}</S.BidButton>
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
      )}
      </div>
  );
};
