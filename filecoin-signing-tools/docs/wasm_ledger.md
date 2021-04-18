# Using with ledger

This library can also help you to connect to a ledger device.


## API

Hardware supported functionalities.

### keyRetrieveFromDevice

Get the public key information from a device using a given path.

Arguments:
* **path**: the BIP44 path as a string (e.g "m/44'/461'/0'/0/1");
* **transport**: the ledger transport;


```javascript
import { keyRetrieveFromDevice } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const path = "m/44'/461'/0'/0/1";

const keys = await keyRetrieveFromDevice(path, transport);

console.log(keys);
```

### showKeyOnDevice

Show the key on the device.

Arguments:
* **path**: the BIP44 path as a string (e.g "m/44'/461'/0'/0/1");
* **transport**: the ledger transport;


```javascript
import { showKeyOnDevice } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const path = "m/44'/461'/0'/0/1";

const keys = await showKeyOnDevice(path, transport);

console.log(keys);
```


### transactionSignWithDevice <Badge text="Removed" type="warning" vertical="middle"/>

Sign the transaction using a device using a given path. Return a ready to send transaction through the [JSON RPC service](/jsonrpc/). However it will not work with lotus json rpc service.

Arguments:
* **transaction**: the filecoin transaction to sign;
* **path**: the BIP44 path as a string (e.g "m/44'/461'/0'/0/1");
* **transport**: the transport initialized;

REMOVED

### transactionSignRawWithDevice

Sign the transaction using a device using a given path. Return only the signature of the transaction.

Arguments:
* **transaction**: the filecoin transaction to sign;
* **path**: the BIP44 path as a string (e.g "m/44'/461'/0'/0/1");
* **transport**: the ledger transport;

```javascript
import { transactionSignRawWithDevice } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const transaction = {
    "to": "t17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy",
    "from": "t1b4zd6ryj5dsnwda5jtjxj6ptkia5e35s52ox7ka",
    "nonce": 1,
    "value": "100000",
    "gasprice": "2500",
    "gaslimit": "25000",
    "method": 0,
    "params": ""
};

const path = "m/44'/461'/0'/0/1";

const signature = await transactionSignRawWithDevice(transaction, path, transport);

console.log(signature);
```

### appInfo

Give information on the filecoin App.

Arguments:
* **transport**: the ledger transport;

```javascript
import { appInfo } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const info = await appInfo(transport);

console.log(info);
```

### deviceInfo

Give information on the device info.

Arguments:
* **transport**: the ledger transport;

```javascript
import { deviceInfo } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const info = await deviceInfo(transport);

console.log(info);
```

### getVersion

Get the app version.

Arguments:
* **transport**: the ledger transport;

```javascript
import { getVersion } from '@zondax/filecoin-signing-tools';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

const transport = await TransportNodeHid.create();

const version = await getVersion(transport);

console.log(version);
```
