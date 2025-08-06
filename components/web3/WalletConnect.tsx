import React, { useState } from 'react';
import { useConnect, Connector } from 'wagmi';
import { useRecoilState } from 'recoil';
import ReactGA from 'react-ga4';

import Button from '@/components/button';
import { EventCategory, EventName } from '@/constants/event';
import { downloadClickAtom } from '@/store/web3/state';
import { WalletType } from './WalletPopover';
import { toast } from '@/utils/toast';

type WalletConnectProps = {
  setWalletType?: (type: WalletType) => void;
};

const errorMessages: Record<string, string> = {
  meta_mask: "Please install MetaMask extension or check if it's unlocked.",
  token_pocket: "Please install TokenPocket or check if it's unlocked.",
  bitget_wallet: "Please install Bitget Wallet or check if it's unlocked.",
  particle_network: "Particle Network connection failed. Please try again.",
  wallet_connect: "WalletConnect connection failed. Please try again.",
};

function WalletConnect({ setWalletType }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [downloadClick, setDownloadClick] = useRecoilState(downloadClickAtom);

  const { connect, connectors } = useConnect({
    onSuccess: ({ connector }) => {
      setIsConnecting(false);
      if (connector) {
        localStorage.setItem('lastConnectedWallet', connector.id);
      }
      ReactGA.event({
        category: EventCategory.Global,
        action: EventName.ConnectResult,
        label: 'success',
      });
    },
    onError: (error, { connector }) => {
      setIsConnecting(false);
      ReactGA.event({
        category: EventCategory.Global,
        action: EventName.ConnectResult,
        label: 'failed',
      });

      const walletKey = connector?.id || 'unknown';

      if (error.name === 'ConnectorNotFoundError' && connector?.name === 'MetaMask') {
        window.open('https://metamask.io');
        return;
      }

      toast.error(errorMessages[walletKey] || 'Connection failed. Please try again.');
    },
  });

  const connectWallet = async (connector: Connector) => {
    if (!connector) return;
    setIsConnecting(true);
    try {
      await connect({ connector });
    } catch {
      setIsConnecting(false);
    }
  };

  const onConnectClick = (walletKey: string, index: number) => {
    ReactGA.event({
      category: EventCategory.Global,
      action: EventName.ConnectWallet,
      label: walletKey,
    });

    const connector = connectors[index];
    if (!connector) {
      toast.error('Wallet not found or not supported.');
      return;
    }

    connectWallet(connector);
  };

  return (
    <div className="flex-center-y p-6">
      <h4 className="text-xl font-medium">Connect wallet</h4>

      <div className="mt-6 grid grid-cols-2 gap-3 px-4">
        <Button
          type="bordered"
          className="flex-center col-span-2 gap-2"
          disabled={isConnecting}
          onClick={() => onConnectClick('meta_mask', 0)}
        >
          <img className="h-7.5 w-7.5" src="/img/metamask@2x.png" alt="MetaMask" />
          <span className="text-sm">{isConnecting ? 'Connecting...' : 'MetaMask'}</span>
        </Button>

        <Button
          type="bordered"
          className="flex-center gap-2"
          disabled={isConnecting}
          onClick={() => onConnectClick('token_pocket', 1)}
        >
          <img className="h-7.5 w-7.5" src="/img/tokenPocket.png" alt="TokenPocket" />
          <span className="text-sm">TokenPocket</span>
        </Button>

        <Button
          type="bordered"
          className="flex-center gap-2"
          disabled={isConnecting}
          onClick={() => onConnectClick('bitget_wallet', 2)}
        >
          <img className="h-7.5 w-7.5" src="/img/bitgetWallet.png" alt="Bitget Wallet" />
          <span className="text-sm">Bitget Wallet</span>
        </Button>

        <Button
          type="bordered"
          className="flex-center gap-2 px-6"
          disabled={isConnecting}
          onClick={() => onConnectClick('particle_network', 3)}
        >
          <img className="h-7.5 w-7.5" src="/img/particleNetwork.png" alt="Particle Network" />
          <span className="whitespace-nowrap text-sm">Particle Network</span>
        </Button>

        <Button
          type="bordered"
          className="flex-center gap-2"
          disabled={isConnecting}
          onClick={() => onConnectClick('wallet_connect', 4)}
        >
          <img className="h-7.5 w-7.5" src="/img/walletconnet.png" alt="WalletConnect" />
          <span className="text-sm">WalletConnect</span>
        </Button>
      </div>

      <div className="mt-4 px-4 text-xs text-gray">
        {downloadClick ? 'Please refresh page after installation. Re-install ' : "Don't have one? "}
        <span
          className="cursor-pointer text-blue"
          onClick={() => {
            setDownloadClick(true);
            setWalletType?.(WalletType.DOWNLOAD);
          }}
        >
          click here
        </span>
      </div>
    </div>
  );
}

export default React.memo(WalletConnect);
