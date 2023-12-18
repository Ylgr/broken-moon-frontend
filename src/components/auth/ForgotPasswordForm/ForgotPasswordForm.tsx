import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseForm } from '@app/components/common/forms/BaseForm/BaseForm';
import * as S from './ForgotPasswordForm.styles';
import * as Auth from '@app/components/layouts/AuthLayout/AuthLayout.styles';
import { useAppDispatch } from '@app/hooks/reduxHooks';
import { doResetPassword } from '@app/store/slices/authSlice';
import { notificationController } from '@app/controllers/notificationController';

interface ForgotPasswordFormData {
  email: string;
}

const initValues = {
  email: 'chris.johnson@altence.com',
};

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = (values: ForgotPasswordFormData) => {
    setLoading(true);
    dispatch(doResetPassword(values))
      .unwrap()
      .then(() => {
        navigate('/auth/security-code');
      })
      .catch((err) => {
        notificationController.error({ message: err.message });
        setLoading(false);
      });
  };

  return (
    <Auth.FormWrapper>
      <BaseForm layout="vertical" onFinish={handleSubmit} requiredMark="optional" initialValues={initValues}>
        <Auth.BackWrapper onClick={() => navigate(-1)}>
          <Auth.BackIcon />
          {t('common.back')}
        </Auth.BackWrapper>
        <Auth.FormTitle>Existed account:</Auth.FormTitle>
        <S.Description>Account (email - password (and wallet password)):</S.Description>
        <p>test@gmail.com - test</p>
        <p>account@gmail.com - account</p>
        <p>alice@gmail.com - alice</p>
        <p>bob@gmail.com - bob</p>
        <p>charlie@gmail.com - charlie</p>
        <p>dave@gmail.com - dave</p>
        <p>eve@gmail.com - eve</p>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
