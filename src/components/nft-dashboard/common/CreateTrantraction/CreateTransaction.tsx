import React, {useState} from "react";
import {ethers} from "ethers";
import {useAppDispatch, useAppSelector} from "@app/hooks/reduxHooks";
import {Modal} from "@app/components/common/Modal/Modal";
import {Input} from "@app/components/common/inputs/Input/Input";
import {Checkbox} from "antd";
// import {setLocalWallet} from "@app/store/slices/walletSlice";
import {entryPoint, getSmartWalletAddress, provider} from "@app/components/contract/smartWallet";
import * as process from "process";

export const CreateTransaction: React.FC = () => {
    const wallet = useAppSelector((state) => state.wallet);
    const [isUnlockWalletModalVisible, setIsUnlockWalletModalVisible] = useState<boolean>(true);
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState<boolean>(true);
    const [password, setPassword] = useState<string>('test');
    const [localwallet, setLocalwallet] = useState<ethers.Wallet | null>(null);
    const [tx, setTx] = useState<any>(null);
    console.log('wallet: ', wallet)
    const dispatch = useAppDispatch();
    const executeWallet = (new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY as string)).connect(provider);

    if(wallet.ops) {
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
                        setIsUnlockWalletModalVisible(false);
                    }}
                    onCancel={() => setIsUnlockWalletModalVisible(false)}
                >
                    <p>Password:</p>
                    <Input value={password} type="password"/>
                    <Checkbox>Auto unlock in this session</Checkbox>
                </Modal>
            );
        } else {
            return (<Modal
                title="Create transaction"
                visible={isTransactionModalVisible}
                onOk={async () => {
                    let ops: any[] = [];
                    for (const op of wallet.ops) {
                        console.log('wallet.smartWalletAddress: ', wallet.smartWalletAddress)
                        const newOp = Object.assign({}, op);
                        console.log('ops.indexOf(op): ', wallet.ops.indexOf(op))
                        console.log(1)
                        newOp.nonce = (await entryPoint.getNonce(wallet.smartWalletAddress as any, 0 as any)).add(wallet.ops.indexOf(op));
                        if(wallet.isPayAsToken) {
                            alert('not implemented yet')
                            break;
                        }
                        console.log(2)
                        newOp.initCode = '0x';
                        newOp.sender = wallet.smartWalletAddress;
                        newOp.callGasLimit = 500_000;
                        newOp.verificationGasLimit = 500_000;
                        newOp.preVerificationGas = 500_000;
                        newOp.maxFeePerGas = 112;
                        newOp.maxPriorityFeePerGas = 82;
                        newOp.paymasterAndData = '0x';
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
                }}
                onCancel={() => setIsTransactionModalVisible(false)}
            >
                <p>Transaction {tx ? 'done': 'processing'}</p>
                {tx && <a href={'https://testnet.bscscan.com/tx/' + tx.transactionHash} target="_blank">Transaction hash</a>}
            </Modal>)
        }
    } else {
        return (<></>)
    }
};
