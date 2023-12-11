import React from 'react';
import {
  DollarOutlined,
  MoneyCollectOutlined,
  PlusOutlined,
  ReadOutlined,
  RocketOutlined,
  SendOutlined
} from '@ant-design/icons';
import { TransactionType} from '@app/interfaces/interfaces';

interface ActivityStatusItem {
  name: TransactionType;
  title: string;
  color: 'success' | 'warning' | 'secondary';
  icon: React.ReactNode;
}

export const activityStatuses: ActivityStatusItem[] = [
  {
    name: 'bid',
    title: 'nft.status.added',
    color: 'warning',
    icon: <MoneyCollectOutlined />,
  },
  {
    name: 'transfer nft',
    title: 'nft.status.booked',
    color: 'secondary',
    icon: <RocketOutlined />,
  },
  {
    name: 'transfer bic',
    title: 'Transfer',
    color: 'success',
    icon: <SendOutlined />,
  }
];
