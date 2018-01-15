## UDP Encryption

Sttp may be transported using a UDP channel. The method for transporting sttp is with a 1-way communications channel. This allows for communications paths that are one-to-one or one-to-many. If a 2-way communications channel is desired, a separate TCP connection will need to be established to accommodate this mode. This section will describe how a 1-way UDP connection can be accomplished.

This method of transport will only ensure that complete commands are sent only once. This mean that even with duplicate packets commands will not be repeated, and if any packet that is part of a fragment is dropped, the entire command is discarded. It does not guarantee the proper sequencing of commands, so commands can be received out of order. Since one of the main drivers of a UDP transport is reduced latency, adding wait times to properly sequence packets defeats this purpose.

Not all commands supported by sttp can be transported using UDP. While other commands will have some additional values that must be present to communicate over a UDP channel. 

### Summary

There are two packet types that exists for UDP transport. Data Packet, and Key Exchange Packet. The Data Packet contains encrypted and authenticated data from the sender to the receiver. The Key Exchange Packet contains information on the current cipher keys and mode of operation.

The Key Exchange Packet uses public key encryption technology to securely send this cipher information to the receiver. This information is sent to the client on a periodic basis to ensure that this critical piece of information is not missing. 

Before a `key exchange packet` can be created, the server and the client must both exchange public keys. This will mainly occur manually unless an existing TCP connection exists allows for this exchange. These keys must be RSA keys of length 2048-bit or greater. The client's public key will be used to encrypt the `Key Exchange Packet` and the server's private key will be used to sign the packet.

### Data Packet

A data packet will take the following format:

```C
struct {
  int8 KeyID;        //Corresponds to a Key Exchange Packet.
  uint24 Sequence    //A number that increments with each Data Packet.
  byte[] CipherText  //The encrypted sttp command
  byte[N] HMAC.      //The authenication MAC. 
}
DataPacket;
```

Notes about the `DataPacket` fields
* KeyID - This number identifies what KeyExchangePacket must be used to decode the CipherText and validate the HMAC. This field doubles as the packet type. Any value < 250 are packet types `Data Packet`.
* Sequence - A non-repeating sequence number that is used to deduplicate packets and change the AES encryption state. 24 million values are reserved for this function. This value cannot be rolled over, rather a new KeyID must be provided by the sender before the 24 million values are consumed.
* CipherText - The encrypted content. Note, the length of this field is calculated since the total packet length is provided by the UDP protocol and this is the only variable length field. Combining data packets into a single packet is therefore not supported at this level, but can occur at the STTP Command level.
* HMAC - HMAC of the entire packet after encryption. This field is fixed length and its length is defined in the `Key Exchange Packet`

### Key Exchange Packet

Since the data stream will be encrypted, the following information will be provided to decrypt the `Data Packet`.

```C
struct {
  int8 PacketType = 250   //Identifies the packet type.
  int8 Version = 1        //A version code.
  Guid InstanceID;        //A random number.
  int56 CreationTime;     //The time that this packet was created.
  byte[32] EncryptKeyHash //A hash of the public key used to encrypt `Secret`
  byte[32] SignKeyHash    //A hash of the public key that can be used to verify the `Signature`
  int16 SecretLength      //The length of the encrypted block
  SecretData Secret       //A 256 byte field contains the RSA encrypted cipher details.
  int16 SignatureLength   //The length of the signature.
  byte[256] Signature     //SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 
}
KeyExchangePacket;
```

Notes about the `KeyExchangePacket` fields
* PacketType - Identifies that this is a `Key Exchange Packet`
* Version - The version number of the protocol. The current version is Version 1.
* InstanceID - This is a randomly generated ID for every packet. This field is used by the recipient to ignore a duplicate packet if it occurs.
* CreationTime - Provides the time this packet was created. The client will use this number to prevent replay attacks by only accepting packets that arrive within some defined window. Depending on how tightly synchronized the systems are, this could be anywhere from seconds to minutes.
  * Encoded UTC Time: 2 byte Year, 1 byte Month, 1 byte Day, 1 byte Hour, 1 byte Minute, 1 byte Second
* EncryptKeyHash - A SHA-256 hash of the public key that was used to encrypt `Secret`. Since decrypting an RSA is expensive, it's important to know if the public keys match before attempting the decryption. It also allows the recipient to search for the valid key if multiple certificates are active. 
* SignKeyHash - A SHA-256 hash of the public key that can be used to verify the signature. When looking up this public key, it is important to verify the source information of this key because it alone identifies who generated these encryption credentials.
* Secret - RSA with OAEP-SHA1 padding encrypted `SecretData` using the recipients's public certificate. See section below for details about this data. 
* Signature - SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 

> :information_source: Since the SignatureLength is not signed, it's important to validate all bytes of the Signature. Signatures are not truncated. 

Steps must be taken to validate a `Key Exchange Packet`
 2) Ensure that `Version` is supported.
 3) Ensure that `InstanceID` was not recently received. 
 4) Ensure that `CreationTime` represents a valid UTC timestamp. Throwing exceptions here could allow for an easy denial of service attack since exception processing is slow for most languages. 
 5) Ensure that `CreationTime` falls within a pre-configured time window. 
 6) Lookup the encryption keys for `EncryptedKeyHash` and `SignKeyHash` and ensure they are valid.
 7) Ensure that the packet length is as expected based on the encryption keys supplied (Greater than 600 bytes).
 8) Validate the `Signature`. Note: RSA Signature Validation can occur about 30,000 times per second. This represents the greatest threat for a denial of service attack. For a typical packet, this would require about 140 mbit of network bandwidth, so other denial of service mechanism should be in place.
 9) Decrypt `Secret` (This can only occur 1,000 times per second, but will only occur for trusted sources)

### Secret Data

This information is encrypted using the receiver's public key.

```C
struct {
  byte[32] Nonce;         //A random number.
  int8 KeyID;             //Identifies this cipher state.
  int8 ValidMinutes;      //The number of minutes this packet is valid.
  int ValidSequence       //The lower bounds of the vaild sequence numbers.
  CipherMode CipherMode;  //Indicate the cipher that will be used.
  HMACMode HMACMode       //Indicates the MAC that will be used.
  byte[16] IV;            //A 128 bit initialization vector.
  byte[32] KEY;           //A 256 bit encryption key.
  byte[128] HMACKEY;      //A 1024 bit key for the HMAC.
}
SecretData;
```

Notes about the `SecretData` fields
* Nonce - Ensures that the encrypted data is not deterministic. It's not required that any other contents of this packet are changed when resending this data.
* KeyID - This field is combined with Source IP/Port to uniquely identify a sender and which active cipher is used to decrypt a `Data Packet`. Valid ranges for this field are 0-249 inclusive. 250-255 MUST NOT be used since they are used to identify packet types that are not `Data Packets`. 
* ValidMinutes - The number of minutes this packet can be used to decrypt a `DataPacket`. This should be added to the time the packet was received rather than the time provided in `KeyExchangePackets` since clock drifting could make it impossible to use small values like 1 minute. A value of 0 means the key is expired and should not be used any longer.
* ValidSequences - This is the lower bounds of the sequence number of `Data Packets` that should be accepted for this `KeyID`. This field limits the impact of replay attacks when a newly established connections occur. For new connections, sequence numbers before this value must be discarded. For existing connections, a few seconds of grace period should be given in case packets are legitimately reordered during transport. 
* CipherMode - The cipher that will be used for encrypting the `DataPacket`. See section below for details.
* HMACMode - The length of the HMAC field that will be used to authenticate a `DataPacket`. See section below for details.
* IV - The initialization vector to use for the cipher. For Version 1, it will always be 16 bytes long.
* KEY - The encryption key. For Version 1, it is always 32 bytes regardless of the cipher chosen.
* HMACKEY - The key that will be used for the HMAC. For Version 1, it is always 128 bytes regardless of the HMAC chosen.

> :information_source: The cipher information MUST remain the same so long as the KeyID remains the same (CipherMode, HMACMode, IV, Key, HMACKEY only, ValidMinutes and ValidSequence may change). Once the sender decides to change the cipher information, the KeyID must be incremented and a complete set of cipher information must be regenerated (IV, KEY, HMACKey). If the recipient receives that same KeyID with a different cipher state (and the old one has not expired yet), the recipient must assume the old connection has been closed an a new connection is being established. 

### Cipher Mode

Encrypting the `data packet` can take one of the following methods. At the present time, all of these methods are considered secure. Providing 6 options helps future proof the specification if any number of these options are considered broken in the future. All unused values are reserved for future versions of the protocol. 

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

Regardless of the cipher selected, 256-bits is provided to make up the key. For ciphers that require fewer than 256-bits, the left most bits will be used to make up the key, and the remainder will be discarded.

#### CTR Mode

In CTR mode, the cipher will not pad the input data. 

The CTR value that will be encrypted for this data will equal:

`CTR = {(int8)EpicID || (int24)Sequence Number || (int32)Position Index}`

The CTR will be left padded with 0's up to the block size.

Where `Position Index` is the 0-based index of the first byte in an encryption block. Ex: For AES 128-bit block sizes, values would always be 0, 16, 32, 48, ...

#### CBC Mode

In CBC mode, packets will be padded using PKCS7. This could add anywhere from 1 to 17 bytes of extra overhead. 

Since chaining long term cannot be accomplished with UDP, the IV must be changed at the start of every sequence. The IV will be XOR'd with the following data:

`IV-Packet = IV XOR {(int8)EpicID || (int24)Sequence Number }`

The XOR will apply to the right most bytes of the IV.

### HMAC Mode

Authenticating a packet will be accomplished using a key'd HMAC. Authentication is required and serves as a checksum on the data to ensure that the client is using the proper cipher to decode the data. A 32-bit HMAC should be considered as weak as a good checksum and only used in trusted environments.

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

HMAC-SHA256-32Bit truncates a HMAC-SHA256 hash to a 32-bit value, providing 16-bits of security. The left most bytes are kept, the remaining bytes are discarded.

HMAC-SHA256 will use the left 64 bytes of the `HMACKEY`. HMAC-SHA384 and HMAC-SHA512 will use all 128 bytes of the `HMACKEY`. This is the recommended key length for these HMACs.

### Implementation Examples

Since there will not be a feedback loop, the sender will have to make the determination on how to sttp commands are sent to the recipient. One example could be: The entire metadata set is sent once per hour, a metadata delta is sent once per minute, and the real-time stream is sent as it comes in. Specifics how this can be done are outlined in another section (This hasn't been written yet.)

#### Sender Example

As far as how to properly implement the wire-level UDP channel, the following recommendation exists:

 1) When starting a new connection, create a `Key Exchange Packet` with a freshly generated Key, IV, and HMACKEY; and SET KeyID = 0, Sequence = 0, Expire Time = 5 minutes.
 2) Every 15 seconds, create a `Key Exchange Packet` using the same information except update Sequence to the most recent Sequence that was used. 
 3) After half of the sequence numbers have been consumed, or a considerable amount of time has elapsed using the same key (Sequence > 10,000,000 OR Key Lifetime > 24 hours) begin sending 2 `Key Exchange Packets`. One with the old key, and a second with a freshly generated key and KeyID = PrevKeyID + 1, Sequence = 0, Expire Time = 5 minutes. 
    i) Continue sending both `key exchange packets` every 15 seconds. Decrementing the Expire Time of the old packet. 
    ii) After a few minute to ensure the client has received the new key, change the `DataPacket` over to the new key.
    iii) Send the old `Key Exchange Packet` with a Expire Time = 0 minutes a few more times.
    iv) The key has been exchanged, continue with Step 2. 

After a KeyID has been sufficiently expired, it may be safely reused. This scheme will permit a few hundred thousand packets per second to be transmitted over UDP. This should be well above the typical use case. In addition, the sender must implement its own flow control algorithm since UDP will not be throttled by the socket layer. For streaming data, this isn't a large concern, but for metadata exchanges, it would be easy to overwhelm a connection and drop packets.

#### Receiver Example

In addition to properly following the sequence in the Sender Example, the receiver must be able to ignore duplicate packets when it receives them. 

For `Key Exchange Packets`, the steps taken to validate the key exchange packet is sufficient to eliminate the impact on duplicates.

For `Data Packets`, the receiver must keep track a bitmask window at least 32 bits long to identify what sequence numbers is has recently received every valid KeyID. If the sequence number if older than the oldest one being tracked, it must be discarded. If a newer, then the packet must be validated first using the HMAC before the tracked sequence window will be advanced. The tracked sequence window must also be advanced when it receives an update ValidSequences number in a `Key Exchange Packet`. 

### Security Considerations

* For multicast streams, all recipients must be provided with the same cipher state. Since data packets are authenticated using an HMAC, this means that anyone with the cipher state can impersonate the server. Therefore all recipients of a multicast stream should be trusted entities with similar security levels.

* When using a CTR based cipher, the contents can easily be forged, therefore a strong HMAC is desired for untrusted environments. If using CBC, a successful forgery will likely result in a parsing error that will terminate the connection. Therefore a secure HMAC is less critical.

* Since CTR packets don't incorporate padding, the length of the encrypted data will be leaked. This may or may not pose a creditable threat. With CBC, padding results in an increase of anywhere from 1 to 17 bytes, keeping the packet length somewhat obscure. 

* The safest way to protect the sender against a DoS Attack is by using UDP, however, this opens up additional DoS attack risks for the recipient of this data.

* Since UPD packets are extremely easy to forge, care should be taken when sending this information through an untrusted environment such as the Internet. A hardware assisted DoS solutions can provide more targeted protection when using TCP. 

### Other Considerations

* While the upper bounds of the RSA certificate is not limited, at 4096-bit the packet size is increased to about 1KB. This is getting close to the boundaries of a fragmented packet limit. At 8192-bit, this would exceed the maximum packet size and some networks will not transport fragmented UDP packets.