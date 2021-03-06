// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class LOG_BLABS extends ethereum.Event {
  get params(): LOG_BLABS__Params {
    return new LOG_BLABS__Params(this);
  }
}

export class LOG_BLABS__Params {
  _event: LOG_BLABS;

  constructor(event: LOG_BLABS) {
    this._event = event;
  }

  get caller(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get blabs(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class LOG_NEW_POOL extends ethereum.Event {
  get params(): LOG_NEW_POOL__Params {
    return new LOG_NEW_POOL__Params(this);
  }
}

export class LOG_NEW_POOL__Params {
  _event: LOG_NEW_POOL;

  constructor(event: LOG_NEW_POOL) {
    this._event = event;
  }

  get caller(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get pool(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Factory extends ethereum.SmartContract {
  static bind(address: Address): Factory {
    return new Factory("Factory", address);
  }

  getBLabs(): Address {
    let result = super.call("getBLabs", "getBLabs():(address)", []);

    return result[0].toAddress();
  }

  try_getBLabs(): ethereum.CallResult<Address> {
    let result = super.tryCall("getBLabs", "getBLabs():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  isBPool(b: Address): boolean {
    let result = super.call("isBPool", "isBPool(address):(bool)", [
      ethereum.Value.fromAddress(b)
    ]);

    return result[0].toBoolean();
  }

  try_isBPool(b: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isBPool", "isBPool(address):(bool)", [
      ethereum.Value.fromAddress(b)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  newBPool(): Address {
    let result = super.call("newBPool", "newBPool():(address)", []);

    return result[0].toAddress();
  }

  try_newBPool(): ethereum.CallResult<Address> {
    let result = super.tryCall("newBPool", "newBPool():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CollectCall extends ethereum.Call {
  get inputs(): CollectCall__Inputs {
    return new CollectCall__Inputs(this);
  }

  get outputs(): CollectCall__Outputs {
    return new CollectCall__Outputs(this);
  }
}

export class CollectCall__Inputs {
  _call: CollectCall;

  constructor(call: CollectCall) {
    this._call = call;
  }

  get pool(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class CollectCall__Outputs {
  _call: CollectCall;

  constructor(call: CollectCall) {
    this._call = call;
  }
}

export class NewBPoolCall extends ethereum.Call {
  get inputs(): NewBPoolCall__Inputs {
    return new NewBPoolCall__Inputs(this);
  }

  get outputs(): NewBPoolCall__Outputs {
    return new NewBPoolCall__Outputs(this);
  }
}

export class NewBPoolCall__Inputs {
  _call: NewBPoolCall;

  constructor(call: NewBPoolCall) {
    this._call = call;
  }
}

export class NewBPoolCall__Outputs {
  _call: NewBPoolCall;

  constructor(call: NewBPoolCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}

export class SetBLabsCall extends ethereum.Call {
  get inputs(): SetBLabsCall__Inputs {
    return new SetBLabsCall__Inputs(this);
  }

  get outputs(): SetBLabsCall__Outputs {
    return new SetBLabsCall__Outputs(this);
  }
}

export class SetBLabsCall__Inputs {
  _call: SetBLabsCall;

  constructor(call: SetBLabsCall) {
    this._call = call;
  }

  get b(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetBLabsCall__Outputs {
  _call: SetBLabsCall;

  constructor(call: SetBLabsCall) {
    this._call = call;
  }
}
