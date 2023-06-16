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