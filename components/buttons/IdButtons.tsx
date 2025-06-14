"use client"
import {useState} from 'react'
import { Button, Modal } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import styles from './idButtons.module.css';
import { getMessages } from '@/utils/systemMessage';

const SpidButton = ({ lang }: { lang: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="default"
        icon={<LoginOutlined />}
        className={styles.spidButton}
        block
        onClick={showModal}
      >
        {getMessages(lang || 'it')["login-spid"]}
      </Button>
      <Modal
        title={getMessages(lang || 'it')["login-not-available"]}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>{getMessages(lang || 'it')["login-not-available-message"]}</p>
      </Modal>
    </>
  );
};

const CieButton = ({ lang }: { lang: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="default"
        icon={<LoginOutlined />}
        className={styles.cieButton}
        block
        onClick={showModal}
      >
        {getMessages(lang || 'it')["login-cie"]}
      </Button>
      <Modal
        title={getMessages(lang || 'it')["login-not-available"]}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>{getMessages(lang || 'it')["login-not-available-message"]}</p>
      </Modal>
    </>
  );
};

const EidasButton = ({ lang }: { lang: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="default"
        icon={<LoginOutlined />}
        className={styles.eidasButton}
        block
        onClick={showModal}
      >
        Log in with eIDAS
      </Button>
      <Modal
        title={getMessages(lang || 'it')["login-not-available"]}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>{getMessages(lang || 'it')["login-not-available-message"]}</p>
      </Modal>
    </>
  );
};

const DigitalIdentityButtons = ({ lang }: { lang: string }) => {
  return (
    <>
      <SpidButton lang={lang} />
      <CieButton lang={lang} />
      <EidasButton lang={lang} />
    </>
  )
}

export { SpidButton, CieButton, EidasButton, DigitalIdentityButtons };
