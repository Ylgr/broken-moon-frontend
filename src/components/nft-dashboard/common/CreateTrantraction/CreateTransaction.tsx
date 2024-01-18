import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {useAppDispatch, useAppSelector} from "@app/hooks/reduxHooks";
import {Modal} from "@app/components/common/Modal/Modal";
import {Input} from "@app/components/common/inputs/Input/Input";
import {Checkbox} from "antd";
import {
    alchemy,
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
import {sendTransaction} from "@app/api/sendTransaction.api";
import axios from "axios";
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
    const [isCreatedWallet, setIsCreatedWallet] = useState<boolean>(false);

    const paymasterAddress = '0xc6652115584BAcFeD8998Cde132FC2E14d31a4cB'
    const beneficiary = '0xeaBcd21B75349c59a4177E10ed17FBf2955fE697'
    // const beneficiary = '0xB044d9c27e5AF0407df0FEAC0Da4bBd078C4a338'

    const bundlerEndpoint = 'https://arb-sepolia.g.alchemy.com/v2/' + process.env.REACT_APP_ALCHEMY_KEY
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

                const initCreateAccountCallData = bicAccountFactory.interface.encodeFunctionData("createAccount", [localwallet.address as any, 0]);
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
                    const feeData = await provider.getFeeData();
                    for (const op of executeOps){
                        console.log('wallet.smartWalletAddress: ', wallet.smartWalletAddress)
                        const newOp = Object.assign({}, op);
                        console.log('ops.indexOf(op): ', executeOps.indexOf(op))
                        console.log(1)
                        // const index = executeOps.indexOf(op);
                        // const nonce = (await entryPoint.getNonce(wallet.smartWalletAddress as any, 0 as any)).add(index)
                        const nonce = (await entryPoint.getNonce(wallet.smartWalletAddress as any, 0 as any))
                        newOp.nonce = nonce._hex;
                        // newOp.nonce = '0x0';
                        newOp.paymasterAndData = paymasterAddress
                        console.log(2)
                        newOp.initCode = op.initCode || '0x';
                        newOp.sender = wallet.smartWalletAddress;

                        newOp.maxFeePerGas = feeData.maxFeePerGas?._hex;
                        // newOp.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas?._hex;

                        const maxPriorityFeePerGasResult = await axios.post(bundlerEndpoint, {
                            jsonrpc: '2.0',
                            method: 'rundler_maxPriorityFeePerGas',
                            params: [],
                            id: 1,
                        });
                        newOp.maxPriorityFeePerGas = maxPriorityFeePerGasResult.data.result;
                        newOp.signature = '0x0da0e8ffd79a479ff1d3abbd2259127c14d9ef8e0787632255619f380fac86a81e879b4699dadeead1bfa4e75ce6784df9eb2c6fa827a3371527d756455473ae1b';

                        const estimateGas = await axios.post(bundlerEndpoint, {
                            jsonrpc: '2.0',
                            method: 'eth_estimateUserOperationGas',
                            params: [
                                newOp,
                                entryPoint.address
                            ],
                            id: 1,
                        });
                        if(estimateGas.data.error) {
                            newOp.callGasLimit = '0x632EA0';
                            newOp.verificationGasLimit = '0x4C4B40';
                            newOp.preVerificationGas = '0x632EA0';
                        } else {
                            console.log('estimateGas: ', estimateGas.data.result)
                            // newOp.callGasLimit = estimateGas.data.result.callGasLimit;
                            newOp.callGasLimit = '0x' + (BigInt(estimateGas.data.result.callGasLimit) * BigInt(125) / BigInt(100)).toString(16);
                            newOp.verificationGasLimit = estimateGas.data.result.verificationGasLimit;
                            newOp.preVerificationGas = '0x' + (BigInt(estimateGas.data.result.preVerificationGas) * BigInt(125) / BigInt(100)).toString(16);
                        }
                        // 27000000
                        // 200045156
                        const opHash = await entryPoint.getUserOpHash(newOp as any);
                        console.log(3)
                        newOp.signature = ethers.utils.solidityPack(["bytes"], [
                            await localwallet?.signMessage(ethers.utils.arrayify(opHash))
                        ]);
                        console.log('newOp: ', newOp)

                        const sendOperationResult = await axios.post(bundlerEndpoint, {
                            jsonrpc: '2.0',
                            method: 'eth_sendUserOperation',
                            params: [
                                newOp,
                                entryPoint.address
                            ],
                            id: 1,
                        });

                        console.log('sendOperationResult: ', sendOperationResult)
                        ops = [...ops, newOp];
                    }
                    // console.log('ops: ', ops)
                    // const encodedOps = entryPoint.interface.encodeFunctionData("handleOps", [ops, beneficiary]);
                    // try {
                    //     const receipt = await sendTransaction({
                    //         to: entryPoint.address,
                    //         data: encodedOps,
                    //         maxFeePerGas: feeData.maxFeePerGas?._hex,
                    //         maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?._hex
                    //     });
                    //     setTxs([...txs, receipt.transactionHash])
                    //     setIsCreatedWallet(false);
                    // } catch (e) {
                    //     console.log('e: ', JSON.stringify(e))
                    //     alert('Transaction failed')
                    // }
                    // dispatch(setOps([]));
                    // dispatch(setTransactionExecuted(wallet.transactionExecuted + 1));
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
