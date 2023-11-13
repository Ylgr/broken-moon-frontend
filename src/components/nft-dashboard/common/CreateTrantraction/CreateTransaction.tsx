import React, {useState} from "react";
import {ethers} from "ethers";
import {useAppSelector} from "@app/hooks/reduxHooks";
import {Modal} from "@app/components/common/Modal/Modal";
import {Input} from "@app/components/common/inputs/Input/Input";
import {Checkbox} from "antd";

export const CreateTransaction: React.FC = () => {
    const wallet = useAppSelector((state) => state.wallet);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
    console.log('wallet: ', wallet)
    if(wallet.ops) {
        console.log('lets goooooooooooooooo!')
        if(!wallet.localWallet) {
            return (
                <Modal
                    title="Create transaction"
                    visible={isModalVisible}
                    onOk={() => {
                        setIsModalVisible(false)
                    }}
                    onCancel={() => setIsModalVisible(false)}
                >
                    <p>Password:</p>
                    <Input value={"sadasd"}/>
                    <Checkbox>Auto unlock in this session</Checkbox>
                </Modal>
            );
        }
        return (<Modal
            title="Create transaction"
            visible={isModalVisible}
            onOk={() => {
                setIsModalVisible(false)
            }}
            onCancel={() => setIsModalVisible(false)}
        >
            <p>Transaction success</p>
        </Modal>)
    } else {
        return (<></>)
    }
};
