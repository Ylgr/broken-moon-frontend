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
import {setOps} from "@app/store/slices/walletSlice";

export const CreateTransaction: React.FC = () => {
    const wallet = useAppSelector((state) => state.wallet);
    const [isUnlockWalletModalVisible, setIsUnlockWalletModalVisible] = useState<boolean>(true);
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState<boolean>(true);
    const [isActiveWalletModalVisible, setIsActiveWalletModalVisible] = useState<boolean>(true);
    const [password, setPassword] = useState<string>('test');
    const [localwallet, setLocalwallet] = useState<ethers.Wallet | null>(null);
    const [tx, setTx] = useState<any>(null);
    console.log('wallet: ', wallet)
    const dispatch = useAppDispatch();
    const executeWallet = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY  || 'f45791796f5c42fca32bfe860015b6334e430c98fab408b63f9788064a45a1b5')).connect(provider);
    // const executeWallet = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY as string)).connect(provider);
    const [isCreatedWallet, setIsCreatedWallet] = useState<boolean>(false);

    const paymasterAddress = '0xCd3E645946d44F1A165C630182b9734C14A66c17'
    if(wallet.ops) {
        const executeOps = Object.assign([], wallet.ops);
        console.log('lets goooooooooooooooo!')
        if(!localwallet) {
            return (
                <Modal
                    title="Create transaction"
                    visible={isUnlockWalletModalVisible}
                    onOk={() => {
                        const localWallet = ethers.Wallet.fromEncryptedJsonSync(wallet.encryptedWallet as string, password);
                        // dispatch(setLocalWallet(localWallet));
                        setLocalwallet(localWallet)
                        provider.getCode(wallet.smartWalletAddress as any).then((code) => {
                            if(code === '0x') {
                                setIsCreatedWallet(true)
                            }
                        });
                        setIsUnlockWalletModalVisible(false);
                    }}
                    onCancel={() => setIsUnlockWalletModalVisible(false)}
                >
                    <p>Password:</p>
                    <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)}/>
                    <Checkbox checked>Auto unlock in this session</Checkbox>
                </Modal>
            );
        } else {
            if(isCreatedWallet) {
                const initCallData = bicAccountFactory.interface.encodeFunctionData("createAccount", [localwallet.address as any, ethers.constants.HashZero]);
                const callDataForEntrypoint = bicAccountInterface.encodeFunctionData("execute", [bicAccountFactory.address,  ethers.constants.HashZero, ethers.constants.HashZero]);
                const initCode = ethers.utils.solidityPack(
                    ["bytes", "bytes"],
                    [ethers.utils.solidityPack(["bytes"], [bicAccountFactory.address]), initCallData]
                );
                executeOps.unshift({initCode, callData: callDataForEntrypoint});
                executeOps.unshift({callData: bmToken.interface.encodeFunctionData("approve", [paymasterAddress as any, ethers.constants.MaxUint256])});
                executeOps.unshift({callData: bmToken.interface.encodeFunctionData("transfer", [paymasterAddress, ethers.utils.parseEther("1")])});
            }
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
                        newOp.nonce = (await entryPoint.getNonce(wallet.smartWalletAddress as any, 0 as any)).add(executeOps.indexOf(op));
                        if(wallet.isPayAsToken) {
                            newOp.paymasterAndData = paymasterAddress + bmToken.address.slice(2);
                        } else {
                            newOp.paymasterAndData = '0x';
                        }
                        console.log(2)
                        newOp.initCode = op.initCode || '0x';
                        newOp.sender = wallet.smartWalletAddress;
                        newOp.callGasLimit = 500_000;
                        newOp.verificationGasLimit = 500_000;
                        newOp.preVerificationGas = 500_000;
                        newOp.maxFeePerGas = 112;
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
                    const encodedOps = entryPoint.interface.encodeFunctionData("handleOps", [ops, wallet.smartWalletAddress]);
                    console.log('encodedOps: ', encodedOps)
                    const transaction = await executeWallet.sendTransaction({
                        to: entryPoint.address,
                        data: encodedOps,
                        gasLimit: 2000000,
                        gasPrice: 5000000000,
                    });
                    try {
                        const receipt = await transaction.wait();
                        console.log('receipt: ', receipt)
                        setTx(receipt)
                    } catch (e) {
                        console.log('e: ', e)
                    }
                    setIsCreatedWallet(false);
                }}
                onCancel={() => setIsTransactionModalVisible(false)}
            >
                <p>Create transaction?</p>
                {tx && <a href={'https://testnet.bscscan.com/tx/' + tx.transactionHash} target="_blank">Done - Transaction hash</a>}
            </Modal>)
        }
    } else {
        return (<></>)
    }
};
