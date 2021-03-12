import { BigInt, Address, Bytes, store } from '@graphprotocol/graph-ts'
import { LOG_CALL, LOG_JOIN, LOG_EXIT, Transfer } from '../types/templates/Pool/Pool'
import { Pool as BPool } from '../types/templates/Pool/Pool'
import {
  Balancer,
  Pool,
  PoolToken,
  PoolShare,
  TokenPrice
} from '../types/schema'
import {
  hexToDecimal,
  bigIntToDecimal,
  tokenToDecimal,
  createPoolShareEntity,
  createPoolTokenEntity,
  updatePoolLiquidity,
  saveTransaction,
  ZERO_BD,
  decrPoolCount
} from './helpers'

/************************************
 ********** Pool Controls ***********
 ************************************/

export function handleSetSwapFee(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = Pool.load(poolId)
  let swapFee = hexToDecimal(event.params.data.toHexString().slice(-40), 18)
  pool.swapFee = swapFee
  pool.save()

  saveTransaction(event, 'setSwapFee')
}

export function handleSetController(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = Pool.load(poolId)
  let controller = Address.fromString(event.params.data.toHexString().slice(-40))
  pool.controller = controller
  pool.save()

  saveTransaction(event, 'setController')
}

export function handleFinalize(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = Pool.load(poolId)
  // let balance = BigDecimal.fromString('100')
  pool.finalized = true
  pool.symbol = 'SIT'
  // pool.totalShares = balance
  pool.save()

  /*
  let poolShareId = poolId.concat('-').concat(event.params.caller.toHex())
  let poolShare = PoolShare.load(poolShareId)
  if (poolShare == null) {
    createPoolShareEntity(poolShareId, poolId, event.params.caller.toHex())
    poolShare = PoolShare.load(poolShareId)
  }
  poolShare.balance = balance
  poolShare.save()
  */

  let factory = Balancer.load('1')
  factory.finalizedPoolCount = factory.finalizedPoolCount + 1
  factory.save()

  saveTransaction(event, 'finalize')
}

export function handleRebind(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = Pool.load(poolId)
  let tokenBytes = Bytes.fromHexString(event.params.data.toHexString().slice(34,74)) as Bytes
  let tokensList = pool.tokensList || []
  if (tokensList.indexOf(tokenBytes) == -1 ) {
    tokensList.push(tokenBytes)
  }
  pool.tokensList = tokensList
  pool.tokensCount = BigInt.fromI32(tokensList.length)

  let address = Address.fromString(event.params.data.toHexString().slice(34,74))
  let denormWeight = hexToDecimal(event.params.data.toHexString().slice(138), 18)

  let poolTokenId = poolId.concat('-').concat(address.toHexString())
  let poolToken = PoolToken.load(poolTokenId)
  if (poolToken == null) {
    createPoolTokenEntity(poolTokenId, poolId, address.toHexString())
    poolToken = PoolToken.load(poolTokenId)
    pool.totalWeight += denormWeight
  } else {
    let oldWeight = poolToken.denormWeight
    if (denormWeight > oldWeight) {
      pool.totalWeight = pool.totalWeight + (denormWeight - oldWeight)
    } else {
      pool.totalWeight = pool.totalWeight - (oldWeight - denormWeight)
    }
  }

  let balance = hexToDecimal(event.params.data.toHexString().slice(74,138), poolToken.decimals)

  poolToken.balance = balance
  poolToken.denormWeight = denormWeight
  poolToken.save()

  if (balance.equals(ZERO_BD)) {
    decrPoolCount(pool.active, pool.finalized)
    pool.active = false
  }
  pool.save()

  updatePoolLiquidity(poolId)
  saveTransaction(event, 'rebind')
}

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  let poolId = event.address.toHex()
  let pool = Pool.load(poolId)
  pool.joinsCount += BigInt.fromI32(1)
  pool.save()

  let address = event.params.tokenIn.toHex()
  let poolTokenId = poolId.concat('-').concat(address.toString())
  let poolToken = PoolToken.load(poolTokenId)
  let tokenAmountIn = tokenToDecimal(event.params.tokenAmountIn.toBigDecimal(), poolToken.decimals)
  let newAmount = poolToken.balance.plus(tokenAmountIn)
  poolToken.balance = newAmount
  poolToken.save()

  updatePoolLiquidity(poolId)
  saveTransaction(event, 'join')
}

export function handleExitPool(event: LOG_EXIT): void {
  let poolId = event.address.toHex()

  let address = event.params.tokenOut.toHex()
  let poolTokenId = poolId.concat('-').concat(address.toString())
  let poolToken = PoolToken.load(poolTokenId)
  let tokenAmountOut = tokenToDecimal(event.params.tokenAmountOut.toBigDecimal(), poolToken.decimals)
  let newAmount = poolToken.balance.minus(tokenAmountOut)
  poolToken.balance = newAmount
  poolToken.save()

  let pool = Pool.load(poolId)
  pool.exitsCount += BigInt.fromI32(1)
  if (newAmount.equals(ZERO_BD)) {
    decrPoolCount(pool.active, pool.finalized)
    pool.active = false
  }
  pool.save()

  updatePoolLiquidity(poolId)
  saveTransaction(event, 'exit')
}

/************************************
 *********** POOL SHARES ************
 ************************************/

 export function handleTransfer(event: Transfer): void {
  let poolId = event.address.toHex()

  let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let isMint = event.params.src.toHex() == ZERO_ADDRESS
  let isBurn = event.params.dst.toHex() == ZERO_ADDRESS

  let poolShareFromId = poolId.concat('-').concat(event.params.src.toHex())
  let poolShareFrom = PoolShare.load(poolShareFromId)
  let poolShareFromBalance = poolShareFrom == null ? ZERO_BD : poolShareFrom.balance

  let poolShareToId = poolId.concat('-').concat(event.params.dst.toHex())
  let poolShareTo = PoolShare.load(poolShareToId)
  let poolShareToBalance = poolShareTo == null ? ZERO_BD : poolShareTo.balance

  let pool = Pool.load(poolId)

  if (isMint) {
    if (poolShareTo == null) {
      createPoolShareEntity(poolShareToId, poolId, event.params.dst.toHex())
      poolShareTo = PoolShare.load(poolShareToId)
    }
    poolShareTo.balance += tokenToDecimal(event.params.amt.toBigDecimal(), 18)
    poolShareTo.save()
    pool.totalShares += tokenToDecimal(event.params.amt.toBigDecimal(), 18)
  } else if (isBurn) {
    if (poolShareFrom == null) {
    createPoolShareEntity(poolShareFromId, poolId, event.params.src.toHex())
    poolShareFrom = PoolShare.load(poolShareFromId)
  }
    poolShareFrom.balance -= tokenToDecimal(event.params.amt.toBigDecimal(), 18)
    poolShareFrom.save()
    pool.totalShares -= tokenToDecimal(event.params.amt.toBigDecimal(), 18)
  } else {
    if (poolShareTo == null) {
      createPoolShareEntity(poolShareToId, poolId, event.params.dst.toHex())
      poolShareTo = PoolShare.load(poolShareToId)
    }
    poolShareTo.balance += tokenToDecimal(event.params.amt.toBigDecimal(), 18)
    poolShareTo.save()

    if (poolShareFrom == null) {
      createPoolShareEntity(poolShareFromId, poolId, event.params.src.toHex())
      poolShareFrom = PoolShare.load(poolShareFromId)
    }
    poolShareFrom.balance -= tokenToDecimal(event.params.amt.toBigDecimal(), 18)
    poolShareFrom.save()
  }

  if (
    poolShareTo !== null
    && poolShareTo.balance.notEqual(ZERO_BD)
    && poolShareToBalance.equals(ZERO_BD)
  ) {
    pool.holdersCount += BigInt.fromI32(1)
  }

  if (
    poolShareFrom !== null
    && poolShareFrom.balance.equals(ZERO_BD)
    && poolShareFromBalance.notEqual(ZERO_BD)
  ) {
    pool.holdersCount -= BigInt.fromI32(1)
  }

  pool.save()
}

