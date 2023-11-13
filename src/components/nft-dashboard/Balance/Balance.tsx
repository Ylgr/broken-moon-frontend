import React, {useEffect, useState} from 'react';
import {Col, Row} from 'antd';
import {useTranslation} from 'react-i18next';
import {NFTCard} from '@app/components/nft-dashboard/common/NFTCard/NFTCard';
import {useAppDispatch, useAppSelector} from '@app/hooks/reduxHooks';
import {getCurrencyPrice} from '@app/utils/utils';
import * as S from './Balance.styles';
import {bicAccountInterface, bmToken, getTokenBalance} from "@app/components/contract/smartWallet";
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

export const Balance: React.FC = () => {
  const [balance, setBalance] = useState({
    bnb_balance: ethers.BigNumber.from(0),
    bm_balance: ethers.BigNumber.from(0),
  });
  const [isTransferModalVisible, setIsTransferModalVisible] = useState<boolean>(false);
  const [transferToken, setTransferToken] = useState<string>('0x2ef8aa35647530EE276fCBCE2E639F86D8B7F1EB');
  const [transferAddress, setTransferAddress] = useState<string>('0xeaBcd21B75349c59a4177E10ed17FBf2955fE697');
  const [transferAmount, setTransferAmount] = useState<string>('100');
  const userId = useAppSelector((state) => state.user.user?.id);
  const { theme } = useAppSelector((state) => state.theme);
  const smartWalletAddress = useAppSelector((state) => state.wallet.smartWalletAddress as string);
  // const localWallet = useAppSelector((state) => state.wallet.localWallet) as ethers.Wallet;
  const encryptedWallet = useAppSelector((state) => state.wallet.encryptedWallet);
  useEffect(() => {
    console.log('smartWalletAddress', smartWalletAddress);
    smartWalletAddress && getTokenBalance(smartWalletAddress).then((balance) => {
    setBalance(balance);
  })
  }, [userId]);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // async function createOp(smartWalletAddress: string, initCode: string,  initCallData: string, paymasterAndData: string = "0x"): Promise<any> {
  //   const smartWallet = bicAccount(smartWalletAddress);
  //
  // }

  const createTransferOp = async () => {
    const initCallData = bmToken.interface.encodeFunctionData("transfer", [transferAddress as any, ethers.utils.parseEther(transferAmount) as any]);
    const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [transferToken, ethers.constants.HashZero, initCallData]);
    dispatch(setIsPayAsToken(false));
    dispatch(setOps([{callData: callDataForEntrypoint}]));
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
                    {getCurrencyPrice(ethers.utils.formatEther(balance.bnb_balance), 'BNB')}
                  </S.TitleBalanceText>
                </Col>

                <Col span={24}>
                  <Row gutter={[55, 10]} wrap={false}>
                    <Col>
                      <S.SubtitleBalanceText>
                        {getCurrencyPrice(ethers.utils.formatEther(balance.bm_balance), 'BM')}
                      </S.SubtitleBalanceText>
                    </Col>

                {/*    <Col>*/}
                {/*      <S.SubtitleBalanceText>*/}
                {/*        {getCurrencyPrice(formatNumberWithCommas(balance.btc_balance), 'BTC')}*/}
                {/*      </S.SubtitleBalanceText>*/}
                {/*    </Col>*/}
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
                  Broken Moon <DownOutlined />
                </Button>
              </Dropdown>
              <p>{t('modals.toAddress')}</p>
                <Input value={transferAddress}/>
              <p>Amount</p>
                <Input value={transferAmount}/>
            </Modal>
          </Row>
        </NFTCard>
      </Col>
    </Row>
  );
};
