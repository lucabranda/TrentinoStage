import { Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import styles from './id.buttons.module.css';

const SpidButton = () => (
  <Button
    type="default"
    icon={<LoginOutlined />}
    className={styles.spidButton}
    block
    href="https://www.spid.gov.it/"
    target="_blank"
    rel="noopener noreferrer"
  >
    Log in with SPID
  </Button>
);
const CieButton = () => (
  <Button
    type="default"
    icon={<LoginOutlined />}
    className={styles.cieButton}
    block
    href="https://www.cartaidentita.interno.gov.it/"
    target="_blank"
    rel="noopener noreferrer"
  >
    Log in with CIE
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

export { SpidButton, CieButton, EidasButton };
