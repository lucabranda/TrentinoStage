import { Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import styles from './id.buttons.module.css';
import { getMessages } from '@/utils/systemMessage';

const SpidButton = async ({ lang }: { lang: string }) => (
  <Button
    type="default"
    icon={<LoginOutlined />}
    className={styles.spidButton}
    block
    href="https://www.spid.gov.it/"
    target="_blank"
    rel="noopener noreferrer"
  >
    {(await getMessages(lang || 'it'))["login-spid"]}
  </Button>
);
const CieButton = async ({ lang }: { lang: string }) => (
  <Button
    type="default"
    icon={<LoginOutlined />}
    className={styles.cieButton}
    block
    href="https://www.cartaidentita.interno.gov.it/"
    target="_blank"
    rel="noopener noreferrer"
  >
    {(await getMessages(lang || 'it'))["login-cie"]}
  </Button>
);

const EidasButton = () => (
  <Button
    type="default"
    icon={<LoginOutlined />}
    className={styles.eidasButton}
    block
    href="https://ec.europa.eu/digital-strategy/our-policies/eidas_en"
    target="_blank"
    rel="noopener noreferrer"
  >
    Log in with eIDAS
  </Button>
);

const DigitalIdentityButtons = ({ lang }: { lang: string }) => {
  return (
    <>
      <SpidButton lang={lang}/>
      <CieButton lang={lang}/>
      <EidasButton/>
    </>
  )
}

export { SpidButton, CieButton, EidasButton, DigitalIdentityButtons };
