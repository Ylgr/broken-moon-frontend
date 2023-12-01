import React, {useState} from "react";
import {ethers} from "ethers";
import {useAppDispatch, useAppSelector} from "@app/hooks/reduxHooks";
import {Modal} from "@app/components/common/Modal/Modal";
import {Input} from "@app/components/common/inputs/Input/Input";
import {Checkbox} from "antd";
// import {setLocalWallet} from "@app/store/slices/walletSlice";
import {
    bicAccountFactory,
    bicAccountInterface, bmToken,
    entryPoint,
    getSmartWalletAddress,
    provider
} from "@app/components/contract/smartWallet";
import * as process from "process";
import {setOps, setTransactionExecuted} from "@app/store/slices/walletSlice";
import {Badge} from "@app/components/common/Badge/Badge";
import {Avatar} from "@app/components/common/Avatar/Avatar";
import {Button} from "@app/components/common/buttons/Button/Button";
import {Table} from "@app/components/common/Table/Table";

export const CreateTransaction: React.FC = () => {
    const wallet = useAppSelector((state) => state.wallet);
    const [isUnlockWalletModalVisible, setIsUnlockWalletModalVisible] = useState<boolean>(true);
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState<boolean>(true);
    const [isActiveWalletModalVisible, setIsActiveWalletModalVisible] = useState<boolean>(true);
    const [isTransactionProgress, setIsTransactionProgress] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('test');
    const [localwallet, setLocalwallet] = useState<ethers.Wallet | null>(null);
    const [txs, setTxs] = useState<any>([]);
    console.log('wallet: ', wallet)
    const dispatch = useAppDispatch();
    const executeWallet = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY  || 'f45791796f5c42fca32bfe860015b6334e430c98fab408b63f9788064a45a1b5')).connect(provider);
    // const executeWallet = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY as string)).connect(provider);
    const [isCreatedWallet, setIsCreatedWallet] = useState<boolean>(false);

    const paymasterAddress = '0xCd3E645946d44F1A165C630182b9734C14A66c17'
    const beneficiary = '0xeaBcd21B75349c59a4177E10ed17FBf2955fE697'
    // const beneficiary = '0xB044d9c27e5AF0407df0FEAC0Da4bBd078C4a338'
    if(isTransactionProgress) {
        const executeOps = Object.assign([], wallet.ops);
        const opsDetails = Object.assign([], wallet.opsDetails);
        console.log('lets goooooooooooooooo!')
        if(!localwallet) {
            return (
                <Modal
                    title="Create transaction"
                    visible={isUnlockWalletModalVisible}
                    onOk={() => {
                        try {
                            const localWallet = ethers.Wallet.fromEncryptedJsonSync(wallet.encryptedWallet as string, password);
                            // dispatch(setLocalWallet(localWallet));
                            setLocalwallet(localWallet)
                            provider.getCode(wallet.smartWalletAddress as any).then((code) => {
                                if(code === '0x') {
                                    setIsCreatedWallet(true)
                                }
                            });
                            setIsUnlockWalletModalVisible(false);
                        } catch (e) {
                            alert('Wrong password');
                        }
                    }}
                    onCancel={() => {
                        setIsUnlockWalletModalVisible(false)
                        setIsTransactionProgress(false)
                    }}
                >
                    <p>Password:</p>
                    <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)}/>
                    <Checkbox checked>Auto unlock in this session</Checkbox>
                </Modal>
            );
        } else {
            if(isCreatedWallet) {
                console.log('create wallet')
                const initTransferCallData = bmToken.interface.encodeFunctionData("transfer", [paymasterAddress, ethers.utils.parseEther("1")]);
                const callTransferDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bmToken.address, ethers.constants.HashZero, initTransferCallData]);
                executeOps.unshift({callData: callTransferDataForEntrypoint, paymasterAndData: '0x'});
                opsDetails.unshift({
                    actionName: 'create wallet',
                    actionStep: 'transfer',
                    asset: 'BIC',
                    amount: '1',
                    toAddress: paymasterAddress,
                    note: '1 BIC is fee to create wallet'
                });
                const initApproveCallData = bmToken.interface.encodeFunctionData("approve", [paymasterAddress, ethers.constants.MaxUint256]);
                const callApproveDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bmToken.address, ethers.constants.HashZero, initApproveCallData]);
                executeOps.unshift({callData: callApproveDataForEntrypoint, paymasterAndData: '0x'});
                opsDetails.unshift({
                    actionName: 'create wallet',
                    actionStep: 'approve',
                    asset: 'BIC',
                    amount: 'MaxUint256',
                    toAddress: paymasterAddress,
                    note: 'only need one time'
                });

                const initCreateAccountCallData = bicAccountFactory.interface.encodeFunctionData("createAccount", [localwallet.address as any, ethers.constants.HashZero]);
                const initCode = ethers.utils.solidityPack(
                    ["bytes", "bytes"],
                    [ethers.utils.solidityPack(["bytes"], [bicAccountFactory.address]), initCreateAccountCallData]
                );
                executeOps.unshift({initCode, callData: '0x', paymasterAndData: '0x'});
                opsDetails.unshift({
                    actionName: 'create wallet',
                    actionStep: 'create account',
                    asset: 'BIC',
                    amount: '0',
                    toAddress: bicAccountFactory.address,
                    note: ''
                });
            }
            console.log('opsDetails: ', opsDetails);
            return (<Modal
                title="Create transaction"
                visible={isTransactionModalVisible}
                onOk={async () => {
                    let ops: any[] = [];
                    for (const op of executeOps) {
                        console.log('wallet.smartWalletAddress: ', wallet.smartWalletAddress)
                        const newOp = Object.assign({}, op);
                        console.log('ops.indexOf(op): ', executeOps.indexOf(op))
                        console.log(1)
                        const index = executeOps.indexOf(op);
                        newOp.nonce = (await entryPoint.getNonce(wallet.smartWalletAddress as any, 0 as any)).add(index);
                        if(!newOp.paymasterAndData) {
                            if(wallet.isPayAsToken) {
                                newOp.paymasterAndData = paymasterAddress + bmToken.address.slice(2);
                            } else {
                                newOp.paymasterAndData = '0x'
                            }
                        }
                        console.log(2)
                        newOp.initCode = op.initCode || '0x';
                        newOp.sender = wallet.smartWalletAddress;
                        newOp.callGasLimit = 500_000;
                        newOp.verificationGasLimit = 500_000;
                        newOp.preVerificationGas = 500_000;
                        newOp.maxFeePerGas = (newOp.paymasterAndData === '0x' && isCreatedWallet && index < 3) ? 0 : 112;
                        newOp.maxPriorityFeePerGas = 82;
                        newOp.signature = '0x';
                        console.log('newOp: ', newOp)
                        const opHash = await entryPoint.getUserOpHash(newOp as any);
                        console.log(3)
                        newOp.signature = ethers.utils.solidityPack(["bytes"], [
                            await localwallet?.signMessage(ethers.utils.arrayify(opHash))
                        ]);
                        ops = [...ops, newOp];
                    }
                    console.log('ops: ', ops)
                    const encodedOps = entryPoint.interface.encodeFunctionData("handleOps", [ops, beneficiary]);
                    console.log('encodedOps: ', encodedOps)
                    const transaction = await executeWallet.sendTransaction({
                        to: entryPoint.address,
                        data: encodedOps,
                        // gasLimit: 2000000,
                        gasLimit: 20000000,
                        gasPrice: 5000000000,
                    });
                    try {
                        const receipt = await transaction.wait();
                        setTxs([...txs, receipt.transactionHash])
                        setIsCreatedWallet(false);
                    } catch (e) {
                        console.log('e: ', JSON.stringify(e))
                        alert('Transaction failed')
                    }
                    dispatch(setOps([]));
                    dispatch(setTransactionExecuted(wallet.transactionExecuted + 1));
                }}
                onCancel={() => {
                    setIsTransactionModalVisible(false)
                    setIsTransactionProgress(false)
                }}
            >
                <p>Create transaction?</p>
                <Table
                    columns={[
                        {
                            title: 'actionName',
                            dataIndex: 'actionName',
                        },
                        {
                            title: 'actionStep',
                            dataIndex: 'actionStep',
                        },
                        {
                            title: 'asset',
                            dataIndex: 'asset',
                        },
                        {
                            title: 'amount',
                            dataIndex: 'amount',
                        },
                        {
                            title: 'toAddress',
                            dataIndex: 'toAddress',
                        },
                        {
                            title: 'note',
                            dataIndex: 'note',
                        }
                    ]}
                    dataSource={opsDetails}
                    loading={false}
                    scroll={{ x: 800 }}
                    bordered
                />
                {txs.map((tx: string) => <a href={'https://testnet.bscscan.com/tx/' + tx} target="_blank">Transaction hash  -  </a>)}
            </Modal>)
        }
    }
    const opsCount = (wallet.ops && wallet.ops.length) || 0
    return (
        <div>

            <Badge count={opsCount}>
                <Button onClick={() => {
                    setIsTransactionProgress(true)
                    if(!localwallet) {
                        setIsUnlockWalletModalVisible(true)
                    } else {
                        setIsTransactionModalVisible(true)
                    }
                }} disabled={!opsCount}>Create transaction</Button>
            </Badge>
        </div>
    )
};
