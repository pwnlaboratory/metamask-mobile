import URL from 'url-parse';
import networksWithImages from 'images/image-icons';
import {
  MAINNET,
  NETWORKS_CHAIN_ID,
  SEPOLIA,
  RPC,
  LINEA_GOERLI,
  LINEA_MAINNET,
  LINEA_SEPOLIA,
} from '../../../app/constants/network';
import { NetworkSwitchErrorType } from '../../../app/constants/error';
import {
  ChainId,
  NetworkType,
  convertHexToDecimal,
  toHex,
} from '@metamask/controller-utils';
import { isStrictHexString } from '@metamask/utils';
import Engine from '../../core/Engine';
import { toLowerCaseEquals } from '../general';
import { fastSplit } from '../number';
import handleNetworkSwitch from './handleNetworkSwitch';
import { regex } from '../../../app/util/regex';

export { handleNetworkSwitch };

/* eslint-disable */
const ethLogo = require('../../images/eth-logo-new.png');
const sepoliaLogo = require('../../images/sepolia-logo-dark.png');
const lineaTestnetLogo = require('../../images/linea-testnet-logo.png');
const lineaMainnetLogo = require('../../images/linea-mainnet-logo.png');

/* eslint-enable */
import {
  PopularList,
  UnpopularNetworkList,
  CustomNetworkImgMapping,
} from './customNetworks';
import { strings } from '../../../locales/i18n';
import {
  getEtherscanAddressUrl,
  getEtherscanBaseUrl,
  getEtherscanTransactionUrl,
} from '../etherscan';
import {
  LINEA_FAUCET,
  LINEA_MAINNET_BLOCK_EXPLORER,
  LINEA_SEPOLIA_BLOCK_EXPLORER,
  MAINNET_BLOCK_EXPLORER,
  SEPOLIA_BLOCK_EXPLORER,
  SEPOLIA_FAUCET,
} from '../../constants/urls';
import { getNonceLock } from '../../util/transaction-controller';

/**
 * List of the supported networks
 * including name, id, and color
 *
 * This values are used in certain places like
 * navbar and the network switcher.
 */
export const NetworkList = {
  [MAINNET]: {
    name: 'Ethereum Main Network',
    shortName: 'Ethereum',
    networkId: 1,
    chainId: toHex('1'),
    ticker: 'ETH',
    // Third party color
    // eslint-disable-next-line @metamask/design-tokens/color-no-hex
    color: '#3cc29e',
    networkType: 'mainnet',
    imageSource: ethLogo,
    blockExplorerUrl: MAINNET_BLOCK_EXPLORER,
  },
  [LINEA_MAINNET]: {
    name: 'Linea Main Network',
    shortName: 'Linea',
    networkId: 59144,
    chainId: toHex('59144'),
    ticker: 'ETH',
    // Third party color
    // eslint-disable-next-line @metamask/design-tokens/color-no-hex
    color: '#121212',
    networkType: 'linea-mainnet',
    imageSource: lineaMainnetLogo,
    blockExplorerUrl: LINEA_MAINNET_BLOCK_EXPLORER,
  },
  [SEPOLIA]: {
    name: 'Sepolia',
    shortName: 'Sepolia',
    networkId: 11155111,
    chainId: toHex('11155111'),
    ticker: 'SepoliaETH',
    // Third party color
    // eslint-disable-next-line @metamask/design-tokens/color-no-hex
    color: '#cfb5f0',
    networkType: 'sepolia',
    imageSource: sepoliaLogo,
    blockExplorerUrl: SEPOLIA_BLOCK_EXPLORER,
  },
  [LINEA_SEPOLIA]: {
    name: 'Linea Sepolia',
    shortName: 'Linea Sepolia',
    networkId: 59141,
    chainId: toHex('59141'),
    ticker: 'LineaETH',
    // Third party color
    // eslint-disable-next-line @metamask/design-tokens/color-no-hex
    color: '#61dfff',
    networkType: 'linea-sepolia',
    imageSource: lineaTestnetLogo,
    blockExplorerUrl: LINEA_SEPOLIA_BLOCK_EXPLORER,
  },
  [RPC]: {
    name: 'Private Network',
    shortName: 'Private',
    // Third party color
    // eslint-disable-next-line @metamask/design-tokens/color-no-hex
    color: '#f2f3f4',
    networkType: 'rpc',
  },
};

const NetworkListKeys = Object.keys(NetworkList);

export const SECURITY_PROVIDER_SUPPORTED_CHAIN_IDS_FALLBACK_LIST = [
  NETWORKS_CHAIN_ID.MAINNET,
  NETWORKS_CHAIN_ID.BSC,
  NETWORKS_CHAIN_ID.BASE,
  NETWORKS_CHAIN_ID.POLYGON,
  NETWORKS_CHAIN_ID.ARBITRUM,
  NETWORKS_CHAIN_ID.OPTIMISM,
  NETWORKS_CHAIN_ID.AVAXCCHAIN,
  NETWORKS_CHAIN_ID.LINEA_MAINNET,
  NETWORKS_CHAIN_ID.SEPOLIA,
  NETWORKS_CHAIN_ID.OPBNB,
  NETWORKS_CHAIN_ID.ZKSYNC_ERA,
  NETWORKS_CHAIN_ID.SCROLL,
  NETWORKS_CHAIN_ID.BERACHAIN,
  NETWORKS_CHAIN_ID.METACHAIN_ONE,
];

export const BLOCKAID_SUPPORTED_NETWORK_NAMES = {
  [NETWORKS_CHAIN_ID.MAINNET]: 'Ethereum Mainnet',
  [NETWORKS_CHAIN_ID.BSC]: 'Binance Smart Chain',
  [NETWORKS_CHAIN_ID.BASE]: 'Base',
  [NETWORKS_CHAIN_ID.OPTIMISM]: 'Optimism',
  [NETWORKS_CHAIN_ID.POLYGON]: 'Polygon',
  [NETWORKS_CHAIN_ID.ARBITRUM]: 'Arbitrum',
  [NETWORKS_CHAIN_ID.LINEA_MAINNET]: 'Linea',
  [NETWORKS_CHAIN_ID.SEPOLIA]: 'Sepolia',
  [NETWORKS_CHAIN_ID.OPBNB]: 'opBNB',
  [NETWORKS_CHAIN_ID.ZKSYNC_ERA]: 'zkSync Era Mainnet',
  [NETWORKS_CHAIN_ID.SCROLL]: 'Scroll',
  [NETWORKS_CHAIN_ID.BERACHAIN]: 'Berachain Artio',
  [NETWORKS_CHAIN_ID.METACHAIN_ONE]: 'Metachain One Mainnet',
};

export default NetworkList;

export const getAllNetworks = () =>
  NetworkListKeys.filter((name) => name !== RPC);

/**
 * Checks if network is default mainnet.
 *
 * @param {string} networkType - Type of network.
 * @returns If the network is default mainnet.
 */
export const isDefaultMainnet = (networkType) => networkType === MAINNET;

/**
 * Check whether the given chain ID is Ethereum Mainnet.
 *
 * @param {string} chainId - The chain ID to check.
 * @returns True if the chain ID is Ethereum Mainnet, false otherwise.
 */
export const isMainNet = (chainId) => chainId === '0x1';

export const isLineaMainnet = (networkType) => networkType === LINEA_MAINNET;

export const getDecimalChainId = (chainId) => {
  if (!chainId || typeof chainId !== 'string' || !chainId.startsWith('0x')) {
    return chainId;
  }
  return parseInt(chainId, 16).toString(10);
};

export const isMainnetByChainId = (chainId) =>
  getDecimalChainId(String(chainId)) === String(1);

export const isLineaMainnetByChainId = (chainId) =>
  getDecimalChainId(String(chainId)) === String(59144);

export const isMultiLayerFeeNetwork = (chainId) =>
  chainId === NETWORKS_CHAIN_ID.OPTIMISM;

/**
 * Gets the test network image icon.
 *
 * @param {string} networkType - Type of network.
 * @returns - Image of test network or undefined.
 */
export const getTestNetImage = (networkType) => {
  if (
    networkType === SEPOLIA ||
    networkType === LINEA_GOERLI ||
    networkType === LINEA_SEPOLIA
  ) {
    return networksWithImages?.[networkType.toUpperCase()];
  }
};

export const getTestNetImageByChainId = (chainId) => {
  if (NETWORKS_CHAIN_ID.SEPOLIA === chainId) {
    return networksWithImages?.SEPOLIA;
  }
  if (NETWORKS_CHAIN_ID.LINEA_GOERLI === chainId) {
    return networksWithImages?.['LINEA-GOERLI'];
  }
  if (NETWORKS_CHAIN_ID.LINEA_SEPOLIA === chainId) {
    return networksWithImages?.['LINEA-SEPOLIA'];
  }
};

/**
 * A list of chain IDs for known testnets
 */
const TESTNET_CHAIN_IDS = [
  ChainId[NetworkType.sepolia],
  ChainId[NetworkType['linea-goerli']],
  ChainId[NetworkType['linea-sepolia']],
];

/**
 * A map of testnet chainId and its faucet link
 */
export const TESTNET_FAUCETS = {
  [ChainId[NetworkType.sepolia]]: SEPOLIA_FAUCET,
  [ChainId[NetworkType['linea-goerli']]]: LINEA_FAUCET,
  [ChainId[NetworkType['linea-sepolia']]]: LINEA_FAUCET,
};

export const isTestNetworkWithFaucet = (chainId) =>
  TESTNET_FAUCETS[chainId] !== undefined;

/**
 * Determine whether the given chain ID is for a known testnet.
 *
 * @param {string} chainId - The chain ID of the network to check
 * @returns {boolean} `true` if the given chain ID is for a known testnet, `false` otherwise
 */
export const isTestNet = (chainId) => TESTNET_CHAIN_IDS.includes(chainId);

export function getNetworkTypeById(id) {
  if (!id) {
    throw new Error(NetworkSwitchErrorType.missingNetworkId);
  }
  const filteredNetworkTypes = NetworkListKeys.filter(
    (key) => NetworkList[key].networkId === parseInt(id, 10),
  );
  if (filteredNetworkTypes.length > 0) {
    return filteredNetworkTypes[0];
  }

  throw new Error(`${NetworkSwitchErrorType.unknownNetworkId} ${id}`);
}

export function getDefaultNetworkByChainId(chainId) {
  if (!chainId) {
    throw new Error(NetworkSwitchErrorType.missingChainId);
  }

  let returnNetwork;

  getAllNetworks().forEach((type) => {
    if (toLowerCaseEquals(String(NetworkList[type].chainId), chainId)) {
      returnNetwork = NetworkList[type];
    }
  });

  return returnNetwork;
}

export function hasBlockExplorer(key) {
  return key.toLowerCase() !== RPC;
}

export function isPrivateConnection(hostname) {
  return hostname === 'localhost' || regex.localNetwork.test(hostname);
}

/**
 * Set the value of safe chain validation using preference controller
 *
 * @param {boolean} value
 */
export function toggleUseSafeChainsListValidation(value) {
  const { PreferencesController } = Engine.context;
  PreferencesController.setUseSafeChainsListValidation(value);
}

/**
 * Returns custom block explorer for specific rpcTarget
 *
 * @param {string} providerRpcTarget
 * @param {object} networkConfigurations
 */
export function findBlockExplorerForRpc(rpcTargetUrl, networkConfigurations) {
  const networkConfiguration = Object.values(networkConfigurations).find(
    ({ rpcEndpoints }) => rpcEndpoints?.some(({ url }) => url === rpcTargetUrl),
  );

  if (networkConfiguration) {
    return networkConfiguration?.blockExplorerUrls[
      networkConfiguration?.defaultBlockExplorerUrlIndex
    ];
  }

  return undefined;
}

/**
 * Returns a boolean indicating if both URLs have the same host
 *
 * @param {string} rpcOne
 * @param {string} rpcTwo
 */
export function compareRpcUrls(rpcOne, rpcTwo) {
  // First check that both objects are of the type string
  if (typeof rpcOne === 'string' && typeof rpcTwo === 'string') {
    const rpcUrlOne = new URL(rpcOne);
    const rpcUrlTwo = new URL(rpcTwo);
    return rpcUrlOne.host === rpcUrlTwo.host;
  }
  return false;
}

/**
 * From block explorer url, get rendereable name or undefined
 *
 * @param {string} blockExplorerUrl - block explorer url
 */
export function getBlockExplorerName(blockExplorerUrl) {
  if (!blockExplorerUrl) return undefined;
  const hostname = new URL(blockExplorerUrl).hostname;
  if (!hostname) return undefined;
  const tempBlockExplorerName = fastSplit(hostname);
  if (!tempBlockExplorerName || !tempBlockExplorerName[0]) return undefined;
  return (
    tempBlockExplorerName[0].toUpperCase() + tempBlockExplorerName.slice(1)
  );
}

/**
 * Checks whether the given value is a 0x-prefixed, non-zero, non-zero-padded,
 * hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a correctly formatted hex string,
 * false otherwise.
 */
export function isPrefixedFormattedHexString(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return regex.prefixedFormattedHexString.test(value);
}

export const getNetworkNonce = async ({ from }) => {
  const { nextNonce, releaseLock } = await getNonceLock(from);

  releaseLock();

  return nextNonce;
};

export function blockTagParamIndex(payload) {
  switch (payload.method) {
    // blockTag is at index 2
    case 'eth_getStorageAt':
      return 2;
    // blockTag is at index 1
    case 'eth_getBalance':
    case 'eth_getCode':
    case 'eth_getTransactionCount':
    case 'eth_call':
      return 1;
    // blockTag is at index 0
    case 'eth_getBlockByNumber':
      return 0;
    // there is no blockTag
    default:
      return undefined;
  }
}

/**
 * Gets the current network name given the network provider.
 *
 * @param {Object} providerConfig - The provider configuration for the current selected network.
 * @returns {string} Name of the network.
 */
export const getNetworkNameFromProviderConfig = (providerConfig) => {
  let name = strings('network_information.unknown_network');
  if (providerConfig.nickname) {
    name = providerConfig.nickname;
  } else if (providerConfig.chainId === NETWORKS_CHAIN_ID.MAINNET) {
    name = 'Ethereum Main Network';
  } else if (providerConfig.chainId === NETWORKS_CHAIN_ID.LINEA_MAINNET) {
    name = 'Linea Main Network';
  } else {
    const networkType = providerConfig.type;
    name = NetworkList?.[networkType]?.name || NetworkList[RPC].name;
  }
  return name;
};

/**
 * Gets the image source given both the network type and the chain ID.
 *
 * @param {object} params - Params that contains information about the network.
 * @param {string} params.networkType - Type of network from the provider.
 * @param {string} params.chainId - ChainID of the network.
 * @returns {Object} - Image source of the network.
 */
export const getNetworkImageSource = ({ networkType, chainId }) => {
  const defaultNetwork = getDefaultNetworkByChainId(chainId);

  if (defaultNetwork) {
    return defaultNetwork.imageSource;
  }

  const unpopularNetwork = UnpopularNetworkList.find(
    (networkConfig) => networkConfig.chainId === chainId,
  );

  const customNetworkImg = CustomNetworkImgMapping[chainId];

  const popularNetwork = PopularList.find(
    (networkConfig) => networkConfig.chainId === chainId,
  );

  const network = unpopularNetwork || popularNetwork;
  if (network) {
    return network.rpcPrefs.imageSource;
  }
  if (customNetworkImg) {
    return customNetworkImg;
  }
  return getTestNetImage(networkType);
};

/**
 * It returns an estimated L1 fee for a multi layer network.
 * Currently only for the Optimism network, but can be extended to other networks.
 *
 * @param {Object} eth
 * @param {Object} txMeta
 * @returns {String} Hex string gas fee, with no 0x prefix
 */
export const fetchEstimatedMultiLayerL1Fee = async (eth, txMeta) => {
  const chainId = txMeta.chainId;

  const layer1GasFee =
    await Engine.context.TransactionController.getLayer1GasFee({
      transactionParams: txMeta.txParams,
      chainId,
    });

  const layer1GasFeeNoPrefix = layer1GasFee.startsWith('0x')
    ? layer1GasFee.slice(2)
    : layer1GasFee;

  return layer1GasFeeNoPrefix;
};

/**
 * Returns block explorer address url and title by network
 *
 * @param {string} networkType Network type
 * @param {string} address Ethereum address to be used on the link
 * @param {string} rpcBlockExplorer rpc block explorer base url
 */
export const getBlockExplorerAddressUrl = (
  networkType,
  address,
  rpcBlockExplorer = null,
) => {
  const isCustomRpcBlockExplorerNetwork = networkType === RPC;

  if (isCustomRpcBlockExplorerNetwork) {
    if (!rpcBlockExplorer) return { url: null, title: null };

    const url = `${rpcBlockExplorer}/address/${address}`;
    const title = new URL(rpcBlockExplorer).hostname;
    return { url, title };
  }

  const url = getEtherscanAddressUrl(networkType, address);
  const title = getEtherscanBaseUrl(networkType).replace('https://', '');
  return { url, title };
};

/**
 * Returns block explorer transaction url and title by network
 *
 * @param {string} networkType Network type
 * @param {string} transactionHash hash of the transaction to be used on the link
 * @param {string} rpcBlockExplorer rpc block explorer base url
 */
export const getBlockExplorerTxUrl = (
  networkType,
  transactionHash,
  rpcBlockExplorer = null,
) => {
  const isCustomRpcBlockExplorerNetwork = networkType === RPC;

  if (isCustomRpcBlockExplorerNetwork) {
    if (!rpcBlockExplorer) return { url: null, title: null };

    const url = `${rpcBlockExplorer}/tx/${transactionHash}`;
    const title = new URL(rpcBlockExplorer).hostname;
    return { url, title };
  }

  const url = getEtherscanTransactionUrl(networkType, transactionHash);
  const title = getEtherscanBaseUrl(networkType).replace('https://', '');
  return { url, title };
};

/**
 * Returns if the chainId network provided is already onboarded or not
 * @param {string} chainId - network chain Id
 * @param {obj} networkOnboardedState - Object with onboarded networks
 * @returns
 */
export const getIsNetworkOnboarded = (chainId, networkOnboardedState) =>
  networkOnboardedState[chainId];

/**
 * Convert the given value into a valid network ID. The ID is accepted
 * as either a number, a decimal string, or a 0x-prefixed hex string.
 *
 * @param value - The network ID to convert, in an unknown format.
 * @returns A valid network ID (as a decimal string)
 * @throws If the given value cannot be safely parsed.
 */
export function convertNetworkId(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return `${value}`;
  } else if (isStrictHexString(value)) {
    return `${convertHexToDecimal(value)}`;
  } else if (typeof value === 'string' && /^\d+$/u.test(value)) {
    return value;
  }
  throw new Error(`Cannot parse as a valid network ID: '${value}'`);
}
/**
 * This function is only needed to get the `networkId` to support the deprecated
 * `networkVersion` provider property and the deprecated `networkChanged` provider event.
 * @deprecated
 * @returns - network id of the current network
 */
export const deprecatedGetNetworkId = async () => {
  const ethQuery = Engine.controllerMessenger.call(
    'NetworkController:getEthQuery',
  );

  if (!ethQuery) {
    throw new Error('Provider has not been initialized');
  }

  return new Promise((resolve, reject) => {
    ethQuery.sendAsync({ method: 'net_version' }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(convertNetworkId(result));
      }
    });
  });
};

export const isMultichainVersion1Enabled =
  process.env.MM_MULTICHAIN_V1_ENABLED === 'true';

export const isChainPermissionsFeatureEnabled =
  process.env.MM_CHAIN_PERMISSIONS === 'true';

export const isPermissionsSettingsV1Enabled =
  process.env.MM_PERMISSIONS_SETTINGS_V1_ENABLED === 'true';

export const isPortfolioViewEnabled = process.env.PORTFOLIO_VIEW === 'true';

export const isPortfolioViewEnabledFunction = () =>
  process.env.PORTFOLIO_VIEW === 'true';
