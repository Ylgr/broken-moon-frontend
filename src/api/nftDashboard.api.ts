import PrimeNfts from './mocks/prime-nfts.json';
export interface NftItem {
  image: string;
  // title: string;
  // author: string;
  // currentBid: number;
  // currentBidCrypto: number;
  name: string;
    description: string;
    external_url: string;
    background_color: string;
    attributes?: {
      trait_type: string;
      value: string;
    }[];
    customImage: string;
  customAnimationUrl: string;
}
const primeNfts = PrimeNfts.map((nft) => ({
    ...nft,
    image: nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
    }));


export const getRecentlyAddedNfts = (): Promise<NftItem[]> => {
  return new Promise((res) => {
    res(primeNfts);
  });
};
