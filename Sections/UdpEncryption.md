## UDP Encryption

It is possible to transport sttp over UDP. Currently the only supported method for transporting data over UDP is with a 1-way communications channel. This allows for communications paths that are one-to-one or one-to-many. If a 2-way communications channel is desired, a separate TCP connection will need to be established to accommodate this mode.

> :information_source: For multicast streams, all recipients must be provided with the same cipher state. Since data packets are authenticated using an HMAC, this means that anyone with the cipher state can impersonate the server. Therefore all recipients of a multicast stream should be trusted entities with similiar security levels.

Since there will not be a feedback loop, the server will have to make the determination on how to send metadata and data points to the client. One example could be: The entire metadata set is sent once per hour, a metadata delta is sent once per minute, and the real-time stream is sent as it comes in. 

### Cipher State

Since the data stream will be encrypted, the following state information is necessary to decrypt the cipher stream. 

```C
enum {
  AES-128-CTR = 0,
  AES-256-CTR = 1,
  AES-128-CBC = 2,
  AES-256-CBC = 3
}
CipherMode; //8-bits

enum {
  HMAC-SHA256-32Bit = 0,
  HMAC-SHA256-64Bit = 1,
  HMAC-SHA256-128Bit = 2,
  HMAC-SHA256-256Bit = 3
}
HMACMode; //8-bits

struct {
  int16 EpicID;       //Identifies this cipher state.
  int48 ValidAfter;   //The beginning of the period that this cipher is valid.
  int48 ValidBefore;  //The expire time.
  CipherMode Cipher;  //Indicate the cipher that will be used.
  HMACMode HMAC       //Indicates the MAC that will be used.
  byte[16] IV;        //A 128 bit initialization vector.
  byte[32] AESKEY;    //A 256 bit encryption key.
  byte[64] HMACKEY;   //A 512 bit key for the HMAC.
}
CipherState;
```

Notes about the `CipherState` fields
* EpicID - This field is combined with Source IP/Port to uniquely identify a cipher key inside a `Data Packet`. For security reasons, on a single EpicID should be permitted for a given ValidAfter/ValidBefore time sequence. If a duplicate occurs, an attacker could replay an old Cipher State causing the client to drop all future packets because the MAC fails.
 * One example of encoding an epic would be: {DayOfMonth (5 bits) | HourOfDay (5 bits) | (6 bits, reserved for local sequencing)}
* VaildAfter - Indicates the time that this cipher information is valid. For time synchronization issues, it's recommended to put this time at least a few minutes in the past. This should never be a future time because the client will not even process future packets.
  * Encoded UTC 2 byte Year, 1 byte Month, 1 byte Day, 1 byte Hour, 1 byte Minute.
* ValidBefore - The expire time for the cipher state. It's recommended this be in the near future. Ex: 1 hour or 1 day. This prevents attackers from replaying this cipher long after its no longer being used.
* Cipher - The cipher that will be used for encrypting the `DataPacket`.
* HMAC - The length of the HMAC field that will be used to authenticate a `DataPacket`. If `DataPackets` are encrypted using AES-CTR, it's very easy to forge the contents. So an HMAC Length should be long if the transmission path is not trusted. If AES-CBC is used, it's not likely that a forgery will be properly interpreted by the system and a parsing exception will occur.
* IV - The initialization vector to use for the AES-CTR cipher.
* AESKEY - The length of the encryption key. It is always 32 bytes, regardless if a 128-bit cipher is used.
* HMACKEY - The key that will be used for the HMAC. The recommended key length for HMAC-SHA256 is 64 bytes.

This data can be transmitted in one of two ways. If a hybrid TCP/UDP connection is used, this cipher data can be transmitted over the TCP channel. If UDP Only is used, this must be transmitted from the server to the client over a UDP channel using the `Key Exchange Packet`.


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
  int8 Packet Type = 1     //An ID field identifying the packet type.
  int16 EpicID;            //This will serve as a lookup identifier for the data stream
  int48 Valid After;       //Indicate when this cipher is valid for.
  int48 Valid Before;      //The Expire timestamp
  byte[32] PublicKeyHash   //A SHA-256 hash of the client's public key. 
  int16 CipherBlockLength  //The length of the encrypted block
  RSACipherDetails Cipher  //A 256 byte field contains the RSA encrypted cipher details.
  int16 SignatureLength    //The length of the signature.
  byte[256] Signature      //SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 
}
KeyExchangePacket;
```

Notes about the `KeyExchangePacket` fields
* EpicID - Same as CipherState.EpicID.
* VaildAfter - Indicates the time that this cipher information is valid. For time synchronization issues, it's recommended to put this time at least a few minutes in the past. This should never be a future time because the client will not even process future packets.
  * Encoded UTC 2 byte Year, 1 byte Month, 1 byte Day, 1 byte Hour, 1 byte Minute.
* ValidBefore - The expire time for the cipher state. It's recommended this be in the near future. Ex: 1 hour or 1 day. This prevents attackers from replaying this cipher long after its no longer being used.
* PublicKeyHash - A SHA-256 hash of the public key that was used to encrypt Cipher. Since decrypting RSACipherDetails is expensive, it's important to know if the public keys match before attempting the decryption. This also supports multiple valid pubic keys to exist on the server at one time.
* Cipher - RSA with OAEP Padding encrypted `CipherState` using the client's public certificate. 
* Signature - SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 

> :information_source: Since the SignatureLength is not signed, it's important to validate all bytes of the Signature. Signatures are not truncated.

### Data Packet

A data packet will take the following format:

```C
struct {
  int8 Packet Type = 0     //An ID field identifying the packet type.
  int16 EpicID;            //This identifies a potential corresponding cipher.
  int32 Sequence Number    //A number that is incremented in the connection stream. 
  byte[] CipherText        //The user payload (Using AES-256, CTR, With CTR = {EpicID || Sequence Number || (int32)Block Index} )
  byte[N] HMAC.          //Length determined by the cipher details for the given EPIC. HMAC-SHA-256 (Of the entire packet after encryption).
}
DataPacket;
```

Notes about the `DataPacket` fields
* EpicID - Same as CipherState.EpicID.
* Sequence Number - A non-repeating sequence number that is used to deduplicate packets and change the AES encryption state.
* CipherText - The user payload (Using AES-256, CTR, With CTR = {EpicID || Sequence Number || (int32)Block Index} )
* HMAC - Length determined by the cipher details for the given EPIC. HMAC-SHA-256 (Of the entire packet after encryption).


