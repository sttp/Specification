## UDP Encryption

It is possible to transport sttp over UDP. Currently the only supported method for transporting data over UDP is with a 1-way communications channel. This allows for communications paths that are one-to-one or one-to-many. If a 2-way communications channel is desired, a separate TCP connection will need to be established to accommodate this mode.

> :information_source: For multicast streams, all recipients must be provided with the same cipher state. Since data packets are authenticated using an HMAC, this means that anyone with the cipher state can impersonate the server. Therefore all recipients of a multicast stream should be trusted entities with similiar security levels.

Since there will not be a feedback loop, the server will have to make the determination on how to send metadata and data points to the client. One example could be: The entire metadata set is sent once per hour, a metadata delta is sent once per minute, and the real-time stream is sent as it comes in. 

### Cipher Mode

Encrypting the data packet can take one of the following methods. At the present time, all of these methods are considered secure. Providing 6 options helps future proof the specification if any number of these options are considered broken in the future. All unused values are reserved for future versions of the protocol. 

```C
enum {
  AES-128-CTR = 0,
  AES-192-CTR = 1,
  AES-256-CTR = 2,
  AES-128-CBC = 3,
  AES-192-CBC = 4,
  AES-256-CBC = 5
}
CipherMode; //8-bits
```

Notes about the `CipherMode` fields
* Regardless of the cipher selected, 256-bits will be provided by the cipher state variable. For ciphers that require fewer than 256-bits, the left most bits will be used to make up the key, and the remainder will be ignored.

#### CTR Mode

In CTR mode, the cipher will not pad the input data. Therefore, the length of the cipher text will be leaked. Padding on average will consume 9 bytes of overhead. CTR can also easily be forged, so a strong HMAC is desired for untrusted environments.

The CTR value that will be encrypted for this data will equal:

`CTR = {EpicID || Sequence Number || (int32)Block Index}`

Where `Block Index` corresponds to the position of the encrypted data divided by 16.

#### CBC Mode

In CBC mode, packets will be padded using PKCS7. This could add anywhere from 1 to 17 bytes of extra overhead, however, its highly unlikely that a successful forgery can occur since a parsing exception will most likely be thrown. And only the approximate length will be leaked.

Since chaining long term cannot be accomplished with UDP, the IV will be XOR'd with the following data:

`IV-Packet = IV XOR {EpicID || Sequence Number }`


### HMAC Mode

Authenticating a packet will be accomplished using a key'd HMAC. Authentication is required and serves as a checksum on the data to ensure that the client is using the proper cipher to decode the data. HMAC lengths provide additional security equal to the length of the data stored divided by 2. A 32-bit HMAC should be considered as strong as a basic checksum and only used in trusted environments.

```C
enum {
  HMAC-SHA256-32Bit = 0,
  HMAC-SHA256-64Bit = 1,
  HMAC-SHA256-96Bit = 2,
  HMAC-SHA256-128Bit = 3,
  HMAC-SHA256-256Bit = 4,
  HMAC-SHA384-384Bit = 5,
  HMAC-SHA512-512Bit = 6,

}
HMACMode; //8-bits
```

> :information_source: HMAC-SHA256-32Bit truncates a HMAC-SHA256 hash to a 32 bit hash, providing 16-bits of security.

HMAC-SHA256 will use the left 64 bytes of the `CipherState.HMACKEY`. HMAC-SHA384 and HMAC-SHA512 will use all 128 bytes of the `CipherState.HMACKEY`.

### Cipher State

Since the data stream will be encrypted, the following state information is necessary to decrypt the cipher stream. 

```C
struct {
  int8 EpicID;        //Identifies this cipher state.
  CipherMode Cipher;  //Indicate the cipher that will be used.
  HMACMode HMAC       //Indicates the MAC that will be used.
  byte[16] IV;        //A 128 bit initialization vector.
  byte[32] AESKEY;    //A 256 bit encryption key.
  byte[128] HMACKEY;  //A 1024 bit key for the HMAC.
}
CipherState;
```

Notes about the `CipherState` fields
* EpicID - This field is combined with Source IP/Port to uniquely identify a cipher key used to encrypt a `Data Packet`. Valid ranges for this field are 0-249 inclusive. 250-255 are reserved other packet types. 
* Cipher - The cipher that will be used for encrypting the `DataPacket`.
* HMAC - The length of the HMAC field that will be used to authenticate a `DataPacket`. 
* IV - The initialization vector to use for the cipher.
* AESKEY - The length of the encryption key. It is always 32 bytes.
* HMACKEY - The key that will be used for the HMAC. It is always 128 bytes. 

This data can be transmitted in one of two ways. If a hybrid TCP/UDP connection is used, this cipher data can be transmitted over the TCP channel. If UDP Only is used, this must be transmitted from the server to the client over a UDP channel using the `Key Exchange Packet`.

> :information_source: The same cipher information can be used with different EpicIDs, but it must not be reused with the same EpicID. This would allow replay attacks.

> :information_source: Anytime any field changes (with the exception of only the EpicID), all cipher fields must be completely regenerated. This includes, IV, AESKEY, HMACKEY. 


### Key Exchange Packet

The `CipherState` information can be securely sent to the client over the unidirectional UDP channel on a periodic basis.

> :information_source: Since it's possible that the `Key Exchange Packet` could be dropped, it's recommended to regularly retransmit same packet. The size of this packet depends on the RSA key size, but will be on the order of 1KB. Sending this packet every second isn't going to cause any adverse effects over most communcations mediums, however, once per minute, or once every 15 seconds is probably more reasonable.

Before a `key exchange packet` can be created, the server and the client must both exchange public keys. These keys must be RSA keys of length 2048-bit or greater. They do not have to both be the same length. The client's public key will be used to encrypt the `CipherState` and the server's private key will be used to sign the packet.

> :information_source: While the upper bounds of the RSA certificate is not limited, at 4096-bit, the packet size is increated to about 1KB,  which is getting close to the boundaries of a fragmented packet limit. Some networks will not transport fragmented UDP packets, so 8192-bit keys won't work.

```C
struct {
  byte[32] Nonce;        //Ensures that the encrypted data is not deterministic.
  CipherState Cipher;    //The state of the Cipher.
}
RSACipherDetails;  //Note, this data is encrypted with the Client's RSA key.

struct {
  int8 Packet Type = 250   //An ID field identifying the packet type.
  int8 Version = 1         //The version code of this packet.
  int48 Valid Start;       //The time that this packet is valid for.
  int8 Valid For Minutes;  //The number of minutes this cipher packet is valid for.
  Guid InstanceID;         //A random number used to ignore a repeate of this same packet.
  byte[32] PublicKeyHash   //A SHA-256 hash of the client's public key. 
  int ValidSequenceNumbers //The lower bounds of the vaild sequence numbers.
  int16 CipherBlockLength  //The length of the encrypted block
  RSACipherDetails Cipher  //A 256 byte field contains the RSA encrypted cipher details.
  int16 SignatureLength    //The length of the signature.
  byte[256] Signature      //SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 
}
KeyExchangePacket;
```

Notes about the `KeyExchangePacket` fields
* Packet Type - If the first byte is <250, it's reserved for a Data Packet and the field is equivalent to EpicID, however, >=250 has been reserved for other packet types.
* Version - The version number of the protocol if it changes in the future. Additional cipher suites will not change this version number since the overall structure of this class will remain the same. 
* Valid Start - Indicates the time that this packet information is valid. If this packet is not valid, it will be tossed by the client and not processed. For time synchronization issues, it's recommended to put this time at least a few minutes in the past. 
  * Encoded UTC 2 byte Year, 1 byte Month, 1 byte Day, 1 byte Hour, 1 byte Minute.
* Valid For Minutes - This field will expire a packet. By rule, an expired packet must be tossed to prevent replay attacks causing a loss of data. It is by design that packets must expire in about 3 hours or less. 
* InstanceID - This is a unique ID for the packet. This must be changed every time the contents of the packet are changed. This field is used by the client to ignore packets it has already received.
* PublicKeyHash - A SHA-256 hash of the public key that was used to encrypt Cipher. Since decrypting RSACipherDetails is expensive, it's important to know if the public keys match before attempting the decryption. It also allows the client to search for the valid key if the client has multiple active certificates. 
* ValidSequenceNumbers - This is the first valid sequence number for the data stream. On a periodic basis, the server should report to the client what its active sequence number is. This will minimize the impact of a replay attack.
* Cipher - RSA with OAEP Padding encrypted `RSACipherDetails` using the client's public certificate. 
* Signature - SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 

> :information_source: Since the SignatureLength is not signed, it's important to validate all bytes of the Signature. Signatures are not truncated. 

### Data Packet

A data packet will take the following format:

```C
struct {
  int8 EpicID;             //This identifies a potential corresponding cipher.
  int24 Sequence Number    //A number that is incremented in the connection stream. 
  byte[] CipherText        //The encrypted user payload
  byte[N] HMAC.            //Length determined by the cipher details for the given EPIC. 
}
DataPacket;
```

Notes about the `DataPacket` fields
* EpicID - Same as CipherState.EpicID. This value must be < 250 because values >=250 have a different meaning.
* Sequence Number - A non-repeating sequence number that is used to deduplicate packets and change the AES encryption state. 24 million values are reserved for this function.
* CipherText - The user payload. Might contain padding. See `Cipher Mode` for more details.
* HMAC - Length determined by the cipher details for the given EPIC. Hash is of the entire packet after encryption.


