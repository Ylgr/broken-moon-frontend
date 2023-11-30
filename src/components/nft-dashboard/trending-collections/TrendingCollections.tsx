import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Carousel } from '@app/components/common/Carousel/Carousel';
import { ViewAll } from '@app/components/nft-dashboard/common/ViewAll/ViewAll';
import { NFTCardHeader } from '@app/components/nft-dashboard/common/NFTCardHeader/NFTCardHeader';
import { TrendingCollection } from '@app/components/nft-dashboard/trending-collections/collection/TrendingCollection';
import { useResponsive } from '@app/hooks/useResponsive';
import { ActionInfo } from '@app/api/activity.api';
import * as S from './TrendingCollections.styles';
import {anyNft, marketplace} from "@app/components/contract/smartWallet";

export const TrendingCollections: React.FC = () => {
  const [trending, setTrending] = useState<ActionInfo[]>([]);

  const [auctionList, setAuctionList] = useState<any[]>([]);

  const { mobileOnly, isTablet: isTabletOrHigher } = useResponsive();

  useEffect(() => {
    // getTrendingActivities().then((res) => setTrending(res));
      marketplace.totalAuctions().then((totalActions: BigInt) => {
          const total = parseInt(totalActions.toString());
          marketplace.getAllValidAuctions(0, total -1 ).then((auctions: any[]) => {
             let getAuctions: ActionInfo[] = [];
                auctions.forEach(async (auction: any) => {
                    const nftContract = anyNft(auction.assetContract);
                    const uri = await nftContract.tokenURI(auction.tokenId);
                    fetch(uri.replace('ipfs://', 'https://ipfs.io/ipfs/')).then((res) => res.json()).then((metadata) => {
                        const image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        getAuctions.push({
                            name: metadata.name,
                            auctionCreator: auction.auctionCreator,
                            image: image,
                            assetContract: auction.assetContract,
                            tokenId: auction.tokenId,
                            minimumBidAmount: auction.minimumBidAmount,
                            buyoutBidAmount: auction.buyoutBidAmount,
                            avatar: 'https://api.dicebear.com/7.x/croodles/svg?seed=' + auction.auctionCreator,
                            auctionId: auction.auctionId,
                            startTimestamp: auction.startTimestamp,
                            endTimestamp: auction.endTimestamp,
                            bidBufferBps: auction.bidBufferBps,
                        });

                    }).finally(() => {
                        if(getAuctions.length == auctions.length) {
                            setAuctionList(getAuctions);
                        }
                    });

                });
          });
      })
  }, []);

  const { t } = useTranslation();

  const trendingList = useMemo(() => {
    return {
      mobile: auctionList.map((item, index) => <TrendingCollection key={index} {...item} />).slice(0, 3),
      tablet: auctionList.map((item, index) => (
        <div key={index}>
          <S.CardWrapper>
            <TrendingCollection {...item} />
          </S.CardWrapper>
        </div>
      )),
    };
  }, [auctionList]);

  const sliderRef = useRef<Slider>(null);

  return (
    <>
      <NFTCardHeader title="Market place">
        {isTabletOrHigher && (
          <Row align="middle">
            <Col>
              <ViewAll bordered={false} />
            </Col>

            <Col>
              <S.ArrowBtn type="text" size="small" onClick={() => sliderRef.current && sliderRef.current.slickPrev()}>
                <LeftOutlined />
              </S.ArrowBtn>
            </Col>

            <Col>
              <S.ArrowBtn type="text" size="small" onClick={() => sliderRef.current && sliderRef.current.slickNext()}>
                <RightOutlined />
              </S.ArrowBtn>
            </Col>
          </Row>
        )}
      </NFTCardHeader>

      <S.SectionWrapper>
        {/*{mobileOnly && trendingList.mobile}*/}
        {/**/}
        {/*{isTabletOrHigher && trending.length > 0 && (*/}
          <Carousel
            ref={sliderRef}
            slidesToShow={3}
            responsive={[
              {
                breakpoint: 1900,
                settings: {
                  slidesToShow: 2,
                },
              },
            ]}
          >
            {auctionList.map((item, index) => {
                return (
                <div key={index}>
                    <S.CardWrapper>
                        <TrendingCollection {...item} />
                    </S.CardWrapper>
                </div>
            )})}
          </Carousel>
        {/*)}*/}
      </S.SectionWrapper>

      {mobileOnly && (
        <S.ViewAllWrapper>
          <ViewAll />
        </S.ViewAllWrapper>
      )}
    </>
  );
};
