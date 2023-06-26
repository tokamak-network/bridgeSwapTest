# BridgeSwap

## Goerli Test

```shell
npx hardhat test test/1.BridgeSwapAuditTest_goerli.ts
```

## Mainnet Test
    
1. mainnet fork to local
```shell
npx hardhat node --fork ~
```

2. test the local
```shell
npx hardhat test test/3.BridgeSwapAuditTest_mainnet.ts --network local
```

## Deploy on Goerli
1. check the tokenAddress -> scripts/BridgeDeploy_goerli.ts
```shell
npx hardhat run scripts/BridgeDeploy_goerli.ts --network goerli
```


## Deploy on Mainnet
1. check the tokenAddress -> scripts/BridgeDeploy_mainnet.ts
```shell
npx hardhat run scripts/BridgeDeploy_mainnet.ts --network mainnet
```


## Deploy check
1. check the Storage
```shell
npx hardahat run scripts/checkStorage_mainnet.ts --network mainnet
```


## Deploy verify Goerli
```shell
npx hardhat verify --constructor-args arguments_goerli.js contract_Address --network goerli
```

## Deploy verify Mainnet
```shell
npx hardhat verify --constructor-args arguments_mainnet.js contract_Address --network mainnet
```