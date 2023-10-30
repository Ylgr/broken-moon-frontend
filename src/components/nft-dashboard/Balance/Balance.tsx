import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { NFTCard } from '@app/components/nft-dashboard/common/NFTCard/NFTCard';
import { useAppSelector } from '@app/hooks/reduxHooks';
import { formatNumberWithCommas, getCurrencyPrice } from '@app/utils/utils';
import { getBalance } from '@app/api/earnings.api';
import * as S from './Balance.styles';
import {
  bicAccountAbi,
  bicAccountFactory,
  bmToken, entryPoint,
  getBmBalance,
  getSmartWalletAddress,
  provider
} from "@app/components/contract/smartWallet";
import {P1} from "@app/components/common/typography/P1/P1";
import {Modal} from "@app/components/common/Modal/Modal";
import {Button} from "@app/components/common/buttons/Button/Button";
import {DownOutlined} from "@ant-design/icons";
import {Dropdown} from "@app/components/common/Dropdown/Dropdown";
import {Menu, MenuItem} from "@app/components/common/Menu/Menu";
import {Input} from "@app/components/common/inputs/Input/Input";
import {ethers} from "ethers";
import BmToken from "@app/components/contract/abi/BmToken.json";
export const Balance: React.FC = () => {
  const [balance, setBalance] = useState({
    usd_balance: 0,
    eth_balance: 0,
    btc_balance: 0,
  });
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false);
  const [transferToken, setTransferToken] = useState<string>('0x2ef8aa35647530EE276fCBCE2E639F86D8B7F1EB');
  const [transferAddress, setTransferAddress] = useState<string>('0xeaBcd21B75349c59a4177E10ed17FBf2955fE697');
  const userId = useAppSelector((state) => state.user.user?.id);
  const { theme } = useAppSelector((state) => state.theme);
  const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);
  // const localWallet = useAppSelector((state) => state.wallet.localWallet) as ethers.Wallet;
  const encryptedWallet = useAppSelector((state) => state.wallet.encryptedWallet);
  useEffect(() => {
    console.log('smartWalletAddress', smartWalletAddress);
  getBmBalance(smartWalletAddress).then((bmBalance) => {
    console.log('bmBalance', bmBalance);
  })
    userId && getBalance(userId).then((res) => setBalance(res));
  }, [userId]);

  const { t } = useTranslation();

  const createTransferOp = async () => {
    const bicAccount = new ethers.Contract(smartWalletAddress, bicAccountAbi, provider);
    const data = [
        bmToken.interface.encodeFunctionData('transfer', [transferAddress, ethers.utils.parseEther('1')])
    ]
    const targets = [bmToken.address]
    const value = [0]
    const callDataForEntrypoint = bicAccount.interface.encodeFunctionData('executeBatch', [targets, value, data])
    console.log(1);
    const initCode = ethers.utils.solidityPack(
        ['bytes', 'bytes'],
        [ethers.utils.solidityPack(['address'], [bicAccountFactory.address]), callDataForEntrypoint]
    )
    console.log(2);

    const op = [
        smartWalletAddress,
        await bicAccount.getNonce(),
        initCode,
      callDataForEntrypoint,
        500000,
        500000,
        500000,
        0,
        0,
        0,
        0
    ]
    const opHash = await entryPoint.getUserOpHash(op)
    console.log('opHash: ', opHash);
    const wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedWallet as string, "test");

    const signature = await wallet.signMessage(ethers.utils.arrayify(opHash))
    console.log('signature: ', signature);
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

  return (
    <Row>
      <Col span={24}>
        <S.TitleText level={2}>{t('nft.yourBalance')}</S.TitleText>
      </Col>

      <Col span={24}>
        <NFTCard isSider>
          <Row gutter={[30, 30]}>
            <Col span={24}>
              <Row gutter={[14, 14]}>
                <Col span={24}>
                  <P1>{smartWalletAddress}</P1>
                  <S.TitleBalanceText level={3}>
                    {getCurrencyPrice(formatNumberWithCommas(balance.usd_balance), 'BM')}
                  </S.TitleBalanceText>
                </Col>

                {/*<Col span={24}>*/}
                {/*  <Row gutter={[55, 10]} wrap={false}>*/}
                {/*    <Col>*/}
                {/*      <S.SubtitleBalanceText>*/}
                {/*        {getCurrencyPrice(formatNumberWithCommas(balance.eth_balance), 'ETH')}*/}
                {/*      </S.SubtitleBalanceText>*/}
                {/*    </Col>*/}

                {/*    <Col>*/}
                {/*      <S.SubtitleBalanceText>*/}
                {/*        {getCurrencyPrice(formatNumberWithCommas(balance.btc_balance), 'BTC')}*/}
                {/*      </S.SubtitleBalanceText>*/}
                {/*    </Col>*/}
                {/*  </Row>*/}
                {/*</Col>*/}
              </Row>
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
                  Broken Moon <DownOutlined />
                </Button>
              </Dropdown>
              <p>{t('modals.toAddress')}</p>
                <Input value={transferAddress}/>
            </Modal>
          </Row>
        </NFTCard>
      </Col>
    </Row>
  );
};
