import React, {useEffect, useState} from 'react';
import {Col, Row} from 'antd';
import {useTranslation} from 'react-i18next';
import {NFTCard} from '@app/components/nft-dashboard/common/NFTCard/NFTCard';
import {useAppDispatch, useAppSelector} from '@app/hooks/reduxHooks';
import {getCurrencyPrice} from '@app/utils/utils';
import * as S from './Balance.styles';
import {
  anyNft,
  bicAccountInterface,
  bicRegistrarController,
  bmToken, freeToMintNft,
  getTokenBalance, nameWrapper
} from "@app/components/contract/smartWallet";
import {P1} from "@app/components/common/typography/P1/P1";
import {Modal} from "@app/components/common/Modal/Modal";
import {Button} from "@app/components/common/buttons/Button/Button";
import {DownOutlined} from "@ant-design/icons";
import {Dropdown} from "@app/components/common/Dropdown/Dropdown";
import {Menu} from "@app/components/common/Menu/Menu";
import {Input} from "@app/components/common/inputs/Input/Input";
import {ethers} from "ethers";
import {setIsPayAsToken, setOps} from "@app/store/slices/walletSlice";
import {Switch} from "@app/components/common/Switch/Switch";
import {Panel} from "@app/components/common/Collapse/Collapse";
import * as SA from '@app/pages/uiComponentsPages//UIComponentsPage.styles';
import axios from 'axios';

// @ts-ignore
// @ts-ignore
export const Balance: React.FC = () => {
  const DAYS = 24 * 60 * 60
  const REGISTRATION_TIME = 28 * DAYS
  const [balance, setBalance] = useState({
    bnb_balance: ethers.BigNumber.from(0),
    bm_balance: ethers.BigNumber.from(0),
  });
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false);
  const [isTransferNftModalVisible, setIsTransferNftModalVisible] = useState<boolean>(false);
  const [transferToken, setTransferToken] = useState<string>(bmToken.address);
  const [transferAddress, setTransferAddress] = useState<string>('0xeaBcd21B75349c59a4177E10ed17FBf2955fE697');
  const [transferAmount, setTransferAmount] = useState<string>('100');
  const [ namespaceData, setNamespaceData] = useState<{ id: any; owner: any; name: string; }[]>([])
  const [ ownNamespaceData, setOwnNamespaceData] = useState<{ id: any; owner: any; name: string; }[]>([])
  const [namespaceName, setName] = useState<string>('');
  const [namespacePrice, setPrice] = useState<string>('0');
  const [ownNfts, setOwnNfts] = useState<{address: string; id: any; image: string;}[]>([]);
  const [ownNftSelected, setOwnNftSelected] = useState<{address: string; id: any; image: string;}>({address: '', id: '', image: ''});
  const [nftMintNumber, setNftMintNumber] = useState<number>(0);
  const [previewNftUrls, setPreviewNftUrls] = useState<string[]>([]);
  const [currentTotalSupplyFreeNft, setCurrentTotalSupplyFreeNft] = useState<number>(0);
  const userId = useAppSelector((state) => state.user.user?.id);
  const { theme } = useAppSelector((state) => state.theme);
  const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);
  // const localWallet = useAppSelector((state) => state.wallet.localWallet) as ethers.Wallet;
  const encryptedWallet = useAppSelector((state) => state.wallet.encryptedWallet);
  const ops = useAppSelector((state) => state.wallet.ops);
  useEffect(() => {
    console.log('smartWalletAddress', smartWalletAddress);
    smartWalletAddress && getTokenBalance(smartWalletAddress).then((balance) => {
    setBalance(balance);
    const eventNamespaceNftUrl = "https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=0x7E38c6E84cB75bF5c7475E570ed21F5Ab64Be407&topic0=0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62&topic0_2_opr=and&topic2=0x0000000000000000000000000000000000000000000000000000000000000000&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR"
    axios.get(eventNamespaceNftUrl).then(async (response) => {
      if(response.data) {
        const ids = response.data.result.map((e: { data: string; }) => e.data.substring(0,66))
        const nftData = []
        for(const id of ids) {
          const name = ethers.utils._toEscapedUtf8String(
              await nameWrapper.names(id)
          )
          const removePrefixName = name.substring(7, name.length)
          const startOfSuffix = removePrefixName.search(/[&\/\\#,+()$~%.'":*?<>{}]/g)
          nftData.push({
            id: id,
            owner: await nameWrapper.ownerOf(id),
            name: removePrefixName.substring(0, startOfSuffix),
          })
        }
        setNamespaceData(nftData);
        setOwnNamespaceData(nftData.filter(e => e.owner === smartWalletAddress))
      }
    });
      freeToMintNft.totalSupply().then((totalSupply: BigInt) => {
        setCurrentTotalSupplyFreeNft(parseInt(totalSupply.toString()))
      });
      getNft(freeToMintNft.address).then((freeNft) => {
        getNft('0x5e5aba60b38b8D54Ce37c83dAc8a0F021bE367A9').then((collectionNft) => {
          setOwnNfts([...freeNft, ...collectionNft])
        })
      })
  })
  }, [userId]);

  const getNft = async (nftAddress: string) => {
    const nftInEvents = await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${nftAddress}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic0_2_opr=and&topic2=0x000000000000000000000000${smartWalletAddress.substring(2, smartWalletAddress.length)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const nftInIds = nftInEvents.data.result.map((e: { topics: string[]; }) => parseInt(e.topics[3]))
    const nftOutEvents = await axios.get(`https://api-testnet.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=lastest&address=${nftAddress}&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&topic0_1_opr=and&topic1=0x000000000000000000000000${smartWalletAddress.substring(2, smartWalletAddress.length)}&apikey=E8AJ7W87ZG8A6TU46Q4K1ICFU2GK6YMKYR`)
    const nftOutIds = nftOutEvents.data.result.map((e: { topics: string[]; }) => parseInt(e.topics[3]))
    const nftIds = nftInIds.filter((e: string) => !nftOutIds.includes(e))
    const nfts = []
    for (const id of nftIds) {

      const nftContract = anyNft(nftAddress);
      const uri = await nftContract.tokenURI(id);
      if(uri.includes('https://raw.githubusercontent.com/Ylgr/seadrop')) {
        nfts.push({address: nftAddress, id: id, image: 'https://api.dicebear.com/7.x/adventurer/svg?seed=beincom-test' + id})
      } else {
        const metadata = await axios.get(uri.replace('ipfs://', 'https://ipfs.io/ipfs/'))
        nfts.push({address: nftAddress, id: id, image: metadata.data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')})
      }
    }
    return nfts;
  }

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // async function createOp(smartWalletAddress: string, initCode: string,  initCallData: string, paymasterAndData: string = "0x"): Promise<any> {
  //   const smartWallet = bicAccount(smartWalletAddress);
  //
  // }

  const createTransferOp = async () => {

    const initCallData = bmToken.interface.encodeFunctionData("transfer", [transferAddress as any, ethers.utils.parseEther(transferAmount) as any]);
    const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [transferToken, ethers.constants.HashZero, initCallData]);
    dispatch(setOps([...(ops || []), {callData: callDataForEntrypoint}]));
  }

  const positionMenu = (
      <Menu>
        {/*<MenuItem>*/}
        {/*  <Button type="link" target="_blank" rel="noopener noreferrer">*/}
        {/*    {t('dropdowns.firstItem')}*/}
        {/*  </Button>*/}
        {/*</MenuItem>*/}
        {/*<MenuItem>*/}
        {/*  <Button type="link" target="_blank" rel="noopener noreferrer">*/}
        {/*    {t('dropdowns.secondItem')}*/}
        {/*  </Button>*/}
        {/*</MenuItem>*/}
        {/*<MenuItem>*/}
        {/*  <Button type="link" target="_blank" rel="noopener noreferrer">*/}
        {/*    {t('dropdowns.thirdItem')}*/}
        {/*  </Button>*/}
        {/*</MenuItem>*/}
      </Menu>
  );

  async function getPriceAndSetName(newString: string) {
    if(newString.length === 0) {
      setPrice('0')
    } else if(newString.length !== namespaceName.length) {
      bicRegistrarController.rentPrice(newString, REGISTRATION_TIME).then(
          (price: any) =>
              setPrice(ethers.utils.formatEther(price.base.toString()))
      )
    }
    setName(newString)
  }

  async function createRegistryNamespaceOps() {
    console.log('createRegistryNamespaceOps')
    if(namespaceName.length === 0) {
      console.log('namespaceName.length === 0')
        return;
    }
    let newOps: any[] = [];
    const MAX_EXPIRY: bigint = BigInt("18446744073709551615");
    const secret =
        '0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
    const resolverAddress = "0x9a9d969b5bcC1E299DBff054a86D65D4040cB56E";
    const commitment = await bicRegistrarController.makeCommitment(
        namespaceName,
        smartWalletAddress,
        REGISTRATION_TIME,
        secret,
        resolverAddress,
        [],
        false,
        0,
        MAX_EXPIRY,
    )
    const initCallData = bicRegistrarController.interface.encodeFunctionData("commit", [commitment]);
    const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bicRegistrarController.address, ethers.constants.HashZero, initCallData]);
    newOps.push({callData: callDataForEntrypoint});

    const fee = ethers.utils.parseEther(namespacePrice);
    if(await bmToken.allowance(smartWalletAddress, bicRegistrarController.address) < fee) {
      const initApproveCallData = bmToken.interface.encodeFunctionData("approve", [bicRegistrarController.address, ethers.constants.MaxUint256]);
        const callApproveDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bmToken.address, ethers.constants.HashZero, initApproveCallData]);
      newOps.push({callData: callApproveDataForEntrypoint});
    }
    const initRegisterCallData = bicRegistrarController.interface.encodeFunctionData("register", [namespaceName, smartWalletAddress, REGISTRATION_TIME, secret, resolverAddress, [], false, 0, MAX_EXPIRY, fee]);
    const callRegisterDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bicRegistrarController.address, ethers.constants.HashZero, initRegisterCallData]);
    newOps.push({callData: callRegisterDataForEntrypoint});
    console.log('newOps: ', newOps)
    dispatch(setOps([...(ops || []), ...newOps]));
  }

  async function createMintFreeNftOps() {
    console.log('createMintFreeNftOps')
    if(nftMintNumber === 0) {
      console.log('nftMintNumber === 0')
      return;
    }
    const initCallData = freeToMintNft.interface.encodeFunctionData("mint", [smartWalletAddress,nftMintNumber]);
    const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [freeToMintNft.address, ethers.constants.HashZero, initCallData]);
    dispatch(setOps([...(ops || []), {callData: callDataForEntrypoint}]));
  }

  async function createTransferNftOp() {
    const initCallData = freeToMintNft.interface.encodeFunctionData("transferFrom", [smartWalletAddress, transferAddress, ownNftSelected.id]);
    const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [ownNftSelected.address, ethers.constants.HashZero, initCallData]);
    dispatch(setOps([...(ops || []), {callData: callDataForEntrypoint}]));
  }
  return (
    <Row>
      <Col span={24}>
        <S.TitleText level={2}>{t('nft.yourBalance')}</S.TitleText>
      </Col>
      <SA.CollapseWrapper defaultActiveKey={['1']}>
        <Panel header={ownNamespaceData.length ? `You have ${ownNamespaceData.length} namespace` :"You don't have namespace"} key="1">
          {ownNamespaceData.length ? <Row>
            <p>You have:</p>
            <Row>
              {ownNamespaceData.map((namespace, index) => (
                  <Row>
                    {index? ', ': ''}
                    <a href={"https://testnet.bscscan.com/nft/0x7E38c6E84cB75bF5c7475E570ed21F5Ab64Be407/" +ethers.utils.formatEther(namespace.id).toString().replace('.', '')}>{namespace.name}</a>
                  </Row>))}

            </Row>
          </Row> : ''
          }
          <p>Buy new one?</p>
          <Input value={namespaceName} onChange={(event) => getPriceAndSetName(event.target.value)}></Input>
          <p>Price: {namespacePrice} BIC</p>
            <Button onClick={() => createRegistryNamespaceOps()} block>Buy</Button>
        </Panel>
      </SA.CollapseWrapper>
      <Col span={24}>
        <NFTCard isSider>
          <Row gutter={[30, 30]}>
            <Col span={24}>
              <Row gutter={[14, 14]}>
                <Col span={24}>
                  <P1>{smartWalletAddress}</P1>

                  <S.TitleBalanceText level={3}>
                    {getCurrencyPrice(ethers.utils.formatEther(balance.bnb_balance), 'BNB', false)}
                  </S.TitleBalanceText>
                </Col>
                <Col span={24}>
                  <Row gutter={[55, 10]} wrap={false}>
                    <Col>
                      <S.SubtitleBalanceText>
                        {getCurrencyPrice(ethers.utils.formatEther(balance.bm_balance), 'BM', false)}
                      </S.SubtitleBalanceText>
                    </Col>

                {/*    <Col>*/}
                {/*      <S.SubtitleBalanceText>*/}
                {/*        {getCurrencyPrice(formatNumberWithCommas(balance.btc_balance), 'BTC')}*/}
                {/*      </S.SubtitleBalanceText>*/}
                {/*    </Col>*/}
                  </Row>
                </Col>
                <Col span={24}>
                  <Row gutter={[14, 14]}>
                    <Col span={24}>
                      <p>NFT:</p>
                      {ownNfts.map((nft) => (
                          <img src={nft.image} alt="nft" width={100} height={100} onClick={() => {
                            setOwnNftSelected(nft)
                            setIsTransferNftModalVisible(true)
                          }}/>
                        ))}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>


            <Col span={24}>
              <S.TitleText level={2}>Pay transaction fee as:</S.TitleText>
              <Switch checkedChildren="BIC" unCheckedChildren="BNB" defaultChecked={false} onClick={
                (checked) => {
                  dispatch(setIsPayAsToken(checked));
                }
              } />

            </Col>
            <Col span={24}>
              <S.TransferButton type={theme === 'dark' ? 'ghost' : 'primary'} onClick={() => setIsTransferModalVisible(true)} block>
                {t('nft.transfer')}
              </S.TransferButton>
            </Col>
            <Modal
                title={t('nft.transfer')}
                visible={isTransferModalVisible}
                onOk={() => {
                  createTransferOp()
                  setIsTransferModalVisible(false)
                }}
                onCancel={() => setIsTransferModalVisible(false)}
            >
              <p>{t('modals.token')}</p>
              <Dropdown overlay={positionMenu} trigger={['click']}>
                <Button onClick={(e) => e.preventDefault()}>
                  {/*Broken Moon <DownOutlined />*/}
                  Beincom <DownOutlined />
                </Button>
              </Dropdown>
              <p>{t('modals.toAddress')}</p>
                <Input value={transferAddress} onChange={(e) => {
                  const namespaceList = namespaceData.map((e) => e.name)
                  if(namespaceList.includes(e.target.value)) {
                    const namespace = namespaceData.find((namespace) => namespace.name === e.target.value)
                    setTransferAddress(namespace?.owner)
                  } else {
                    setTransferAddress(e.target.value)
                  }
                }}/>
              <p>Amount</p>
                <Input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}/>
            </Modal>
            <Modal
                title="Transfer NFT"
                visible={isTransferNftModalVisible}
                onOk={() => {
                  createTransferNftOp()
                  setIsTransferNftModalVisible(false)
                }}
                onCancel={() => setIsTransferNftModalVisible(false)}
            >

              <p>{t('modals.toAddress')}</p>
              <Input value={transferAddress} onChange={(e) => {
                const namespaceList = namespaceData.map((e) => e.name)
                if(namespaceList.includes(e.target.value)) {
                  const namespace = namespaceData.find((namespace) => namespace.name === e.target.value)
                  setTransferAddress(namespace?.owner)
                } else {
                  setTransferAddress(e.target.value)
                }
              }}/>
              <img src={ownNftSelected.image} alt={ownNftSelected.id}/>
            </Modal>
          </Row>
        </NFTCard>
      </Col>

      <SA.CollapseWrapper defaultActiveKey={['1']}>
        <Panel header="Want to mint free NFT?" key="2">

          <p>Number of NFT for mint</p>
          <Input type="number" value={nftMintNumber} onChange={(e) => {
            const mintAmount = parseInt(e.target.value)
            console.log('mintAmount: ', mintAmount)
            setNftMintNumber(mintAmount)
            const previewNftUrlsWillMint = []
            for(let i = 0; i < mintAmount; i++) {
              console.log('i: ', i)
              previewNftUrlsWillMint.push(`https://api.dicebear.com/7.x/adventurer/svg?seed=beincom-test${currentTotalSupplyFreeNft+i}`)
            }
            setPreviewNftUrls(previewNftUrlsWillMint)
          }}></Input>
          <p>Preview expected NFT:</p>
          {previewNftUrls.map((url) => (
              <img src={url} alt="nft" width={100} height={100}/>
            ))}
          <Button onClick={() => createMintFreeNftOps()} block disabled={nftMintNumber <= 0}>Mint</Button>
        </Panel>
      </SA.CollapseWrapper>
    </Row>
  );
};
