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


## Deploy
1. check the tokenAddress (what's chain) -> scripts/BridgeDeploy.ts

2. Let's the Deploy
```shell
npx hardhat run scripts/BridgeDeploy.ts --network (any chain)
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