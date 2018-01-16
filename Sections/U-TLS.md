## UDP Transport Layer Security Version 1.0

This document describes a protocol that can be transported over UDP that is a true Fire-And-Forget means of securely sending data from one entity to another. This allows for communications paths that are one-to-one, one-to-many, or even one-to-none. This document will detail how this will be accomplished while maintaining high levels of security. 

While other means of transporting encrypted content over UDP exists. These use bi-directional communications. The purpose of this protocol is to avoid the need to have a data diode in place when transporting data from a secured environment to an unsecured one.

This protocol intentionally has fewer supported cryptographic functions than TCP/TLS, but the ones selected are widely supported in various programming languages and have a strong history in the industry. 

This protocol does not allow for anonymous connections to exist. Each connection must be manually configured by providing the necessary encryption keys for both the sender and the receiver of the data. This manual key exchange is required, otherwise the protocol could not be considered a true Fire-And-Forget protocol. 

### Features

This protocol will provide the following:
* Establish a secure one-way encrypted path (Using RSA-2048 bit keys to encrypt and sign the key data).
* Encrypted of user traffic (AES-CTR or CBC Mode. 128, 192, 256 bit encryption).
* Authenticated user traffic (Using a Keyed HMACs up to 512-bits long. With varieties of SHA256, SHA384, SHA512).
* Data Integrity Checks (Provided by the HMAC)
* Prevents packet duplication and replay attacks of expired data. 
* Protects against Man-in-the-Middle attacks.
* Resistant to Denial-of-Service attacks (Sender Risk: None; Receiver Risk: Low). 

This protocol does not provide:
* Guaranteed Delivery
* Flow Control
* Congestion Notification
* Packets Sequencing.
* Acknowledgments

### Design Overview

There are two packet types that are required for UTLS. `Data Packet,` and `Key Packet.` The `Data Packet` contains encrypted and authenticated user data. The `Key Packet` contains the current cipher keys and mode of operation.

The `Key Packet` uses public key encryption technology to securely send this cipher information to the receiver. This information is sent to the receiver on a periodic basis to ensure that this critical piece of information is not missing or outdated. 

Before a `Key Packet` can be created, the sender and the receiver must exchange public keys. This will usually occur manually. These keys must be RSA keys of length 2048-bit or greater. The receivers's public key will be used to encrypt the `Key Packet` and the senders's private key will be used to sign the same packet. This will securely provide the encryption key to the receiver and authenticate that the cipher came from the server.

### Data Packet

A data packet will take one of the following formats depending on the cipher mode. This is because CBC requires padding, and CTR does not.

If encryption is with AES using CBC mode:
```C
struct {
  byte[] UserData           //The sttp command
  byte[N] HMAC.             //The authenication MAC. 
  int8 HMACLen              //The length of the HMAC.
}
CipherTextCBC;

struct {
  int8 KeyID;            //Corresponds to a Key Exchange Packet.
  uint24 Sequence        //A number that increments with each Data Packet.
  CipherText CipherText  //The encrypted user data and HMAC
}
DataPacketCBC;
```

If the encryption is with AES using CTR mode:
```C
struct {
  byte[] UserData           //The sttp command
  byte[N] HMAC.             //The authenication MAC. 
}
CipherTextCTR;

struct {
  int8 KeyID;            //Corresponds to a Key Exchange Packet.
  uint24 Sequence        //A number that increments with each Data Packet.
  CipherText CipherText  //The encrypted user data and HMAC
}
DataPacketCTR;
```

Notes about the `DataPacket` fields
* `KeyID` - This number identifies what `Key Packet` must be used to decrypt the CipherText and validate the HMAC. This field doubles as the packet type code. Any value < 250 are packet types `Data Packet.` 250 identifies a `Key Packet.` And 251 to 255 is reserved.
* `Sequence` - A non-repeating unsigned sequence number that is used to deduplicate packets and change the encryption inputs. 24 million values are reserved for this function. This value MUST NOT be rolled over, rather a new KeyID must be provided by the sender before the 24 million values are consumed.
* `CipherText` - The encrypted content. Note, the length of this field is calculated since the total packet length is provided by the UDP protocol header. 
* `HMAC` - HMAC of the entire packet before encryption. The length of this field is defined in the `Key Packet,` but will be extended if using a AES-CBC cipher to ensure that CipherText is a multiple of 16 bytes. If this value exceeds the length of the HMAC, only the left most bytes will contain the HMAC bytes, the right most will repeat the value in `HMACLen`.
* `HMACLen` - In AES-CBC mode, packets must be padded to a 16 byte boundary. Rather than pad with with 0's, the HMAC field will be extended a certain number of bytes. In AES-CTR Mode, this field will not exist because CTR data is not padded.

> :information_source: It is critical that `HMACLen` meets or exceeds the length specified in the `Key Packet.` If it does not, the packet must be discarded.

### Key Packet

The sender will provide the following information to the receiver so it can decrypt the `Data Packet.`

```C
struct {
  int8 PacketType = 250   //Identifies the packet type.
  int8 Version = 1        //A version code.
  Guid InstanceID;        //A random number.
  int56 CreationTime;     //The time that this packet was created.
  byte[32] EncryptKeyHash //A hash of the public key used to encrypt `Secret`
  byte[32] SignKeyHash    //A hash of the public key that can verify the `Signature`
  int16 SecretLength      //The length of the encrypted block
  SecretData Secret       //A field contains the encrypted `Secret`.
  int16 SignatureLength   //The length of the signature.
  byte[N] Signature       //The digital signature.
}
KeyPacket;
```

Notes about the `KeyPacket` fields:
* `PacketType` - Identifies that this is a `Key Packet`
* `Version` - The version number of the protocol. The current version is Version 1.
* `InstanceID` - This is a randomly generated ID for every packet. This field is used by the receiver to ignore a duplicate packet if one occurs.
* `CreationTime` - Provides the time this packet was created. The receiver will use this number to prevent replay attacks by only accepting packets that arrive within some defined window. Depending on how tightly the systems are synchronized, this could be anywhere from seconds to minutes. The receiver must determines this value.
  * Encoded UTC Time: 2 byte Year, 1 byte Month, 1 byte Day, 1 byte Hour, 1 byte Minute, 1 byte Second
* `EncryptKeyHash` - A SHA-256 hash of the public key that was used to encrypt `Secret`. Since decrypting an RSA is expensive, it's important to know if the public keys match before attempting the decryption. It also allows the receiver to search for the valid key if multiple keys are active. 
* `SignKeyHash` - A SHA-256 hash of the public key that can be used to verify the signature. When looking up this public key, it is important to verify the source information of this key because it alone identifies who generated these encryption credentials.
* `Secret` - RSA with OAEP-SHA1 padding encrypted `SecretData` using the receiver's public key. See section below for details about `SecretData`. 
* `Signature` - SHA512-RSA-PPS digital signature of entire packet minus the signature length. (Using the senders's private key). 

> :information_source: Since the SignatureLength is not signed, it is important to validate all bytes of the Signature. Signatures are not truncated. 

The following steps must be taken in sequential order when a receiver validates a `Key Packet.` The order has been selected to minimize the impact of a denial of service attack by flooding this kind of packet:
1. Ensure that `Version` is supported.
2. Ensure that `InstanceID` was not recently received.
3. Ensure that `CreationTime` represents a valid UTC timestamp. (Throwing exceptions here could allow for an easy denial of service attack since exception processing is slow for most languages.) 
4. Ensure that `CreationTime` falls within a pre-configured time window. (A few seconds or minutes).
5. Lookup the encryption keys for `EncryptedKeyHash` and `SignKeyHash` and ensure they exist.
6. Ensure that the packet length is as expected based on the encryption keys supplied (Greater than 600 bytes).
7. Validate the `Signature`. Note: RSA Signature Validation can occur about 30,000 times per second. This represents the greatest threat for a denial of service attack. For a typical packet, this would require about 140 mbit of network bandwidth. 
8. Decrypt `Secret` (This can only occur 1,000 times per second, but will only occur for trusted sources)

### Secret Data

This information is encrypted using the receiver's public key.

```C
struct {
  byte[32] Nonce;         //A random number.
  int8 KeyID;             //Identifies this cipher.
  int8 ExpireMinutes;     //The number of minutes this cipher is valid.
  int ValidSequence       //The lower bounds of the vaild sequence numbers.
  CipherMode CipherMode;  //Indicate the cipher that will be used.
  HMACMode HMACMode       //Indicates the MAC that will be used.
  byte[16] IV;            //A 128-bit initialization vector.
  byte[32] KEY;           //A 256-bit encryption key.
  byte[128] HMACKEY;      //A 1024-bit HMAC key.
}
SecretData;
```

Notes about the `SecretData` fields
* `Nonce` - Ensures that the encrypted data is not deterministic. (This is the only field required to change when generating this packet).
* `KeyID` - This field is combined with Source IP/Port to uniquely identify a sender and which active cipher is used to decrypt a `Data Packet`. Valid ranges for this field are 0-249 inclusive. 250-255 MUST NOT be used since they are used to identify packet types that are not `Data Packets`. 
* `ExpireMinutes` - The number of minutes this key is to remain valid after receiving it. This should be added to the time the packet was received rather than the time provided in `KeyExchangePackets` otherwise clock drifting could make it impossible to use small values like 1 minute. A value of 0 means the key is expired and should not be used.
* `ValidSequences` - This is the lower bounds of the sequence number of `Data Packets` that may be accepted for this `KeyID`. This field limits the impact of replay attacks with a newly established connection. For new connections, sequence numbers before this value must be discarded. For existing connections, a grace period of a few seconds should be given in case packets are legitimately reordered during transport. 
* `CipherMode` - The cipher that will be used for encrypting the `DataPacket`. See section below for details.
* `HMACMode` - The HMAC that will be used to authenticate a `DataPacket`. See section below for details.
* `IV` - The initialization vector to use for the cipher. For Version 1, it will always be 16 bytes long.
* `KEY` - The encryption key. For Version 1, it is always 32 bytes regardless of the cipher chosen.
* `HMACKEY` - The key that will be used for the HMAC. For Version 1, it is always 128 bytes regardless of the HMAC chosen.

> :information_source: The cipher information (CipherMode, HMACMode, IV, Key, HMACKEY) MUST remain the same so long as the KeyID remains the same (ValidMinutes and ValidSequence may change). Once the sender decides to change the cipher information, the KeyID must be incremented and a complete set of cipher information must be regenerated (IV, KEY, HMACKey). If the receivers receives that same KeyID with a different cipher state (and the old one has not yet expired), the receiver will assume the old connection has been closed an a new connection is being established. 

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

The CTR value that will be used to encrypt this data will equal:

`CTR = {(int8)EpicID || (int24)Sequence Number || (int32)Position Index}`

Where `Position Index` is the 0-based index of the first byte in an encryption block. Ex: For AES 128-bit block sizes, values would always be 0, 16, 32, 48, ...

The CTR will be right padded with 0's up to the block size.


#### CBC Mode

In CBC mode, packets will be padded by lengthening the HMAC field of the `DataPacket`. This could add anywhere from 1 to 16 bytes of extra overhead. 

Since chaining between packets cannot be accomplished with UDP, the IV must be changed at the start of every sequence. The IV will be XOR'd with the following data:

`IV-Packet = IV XOR (Pad right with 0`s){(int8)EpicID || (int24)Sequence Number }`


### HMAC Mode

Authenticating a packet will be accomplished using a keyed HMAC. Authentication is required and serves as a checksum on the data to ensure that the client is using the proper cipher to decode the data. A 32-bit HMAC should be considered as weak as a good checksum and only used in trusted environments.

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

HMAC-SHA256-32Bit truncates a HMAC-SHA256 hash to a 32-bit value, providing 16-bits of security. The left most bytes are kept, the remaining bytes are discarded. The same is true for other modes.

> :information_source: In AES-CBC mode, the HMAC length will be increased on a packet by packet basis so the data to be encrypted is a multiple of 16 bytes. 

HMAC-SHA256 will use the left 64 bytes of the `HMACKEY`. HMAC-SHA384 and HMAC-SHA512 will use all 128 bytes of the `HMACKEY`. This is the recommended key length for these HMACs.

#### Sender Example

To properly implement the wire-level UDP channel, the following recommendation exists:

1. When starting a new connection, create a `Key Packet` with a freshly generated Key, IV, and HMACKEY; and SET KeyID = 0, Sequence = 0, Expire Minutes = 5.
2. Every 15 seconds, create a `Key Packet` using the same information except update Sequence to the most recent Sequence that was used. 
3. After half of the sequence numbers have been consumed, or a considerable amount of time has elapsed using the same key (i.e. Sequence > 10,000,000 OR Key Lifetime > 24 hours) begin sending two different `Key Packets`. One with the old key, and a second with a freshly generated key and KeyID = PrevKeyID + 1, Sequence = 0, Expire Minutes = 5. 
    1. Continue sending both `Key Packets` every 15 seconds. Decrementing the Expire Minutes of the old packet. 
    2. After a few minute to ensure the client has received the new key, change the `Data Packet` over to the new key.
    3. Send the old `Key Packet` with a Expire Minutes = 0 a few more times.
    4. The key has been exchanged, continue with Step 2. 

After a KeyID has been sufficiently expired, it may be safely reused. This scheme will permit a few hundred thousand packets per second to be transmitted over UDP. This should be well above the typical use case. If this is not the case, the timing of these packets should be shortened. The fundamental limit supported by this protocol would be on the order of 30 million packets per second. That exhausts all 4 billion sequence numbers in 2 minutes.

#### Receiver Example

In addition to properly following the sequence in the Sender Example, the receiver must be able to ignore duplicate packets when it receives them. 

For `Key Packets,` the steps taken to validate the `Key Packet` is sufficient to eliminate the impact with duplicates.

For `Data Packets,` the receiver must track a bitmask window at least 32 bits long to track what sequence numbers it has recently received for every valid KeyID. If the sequence number is older than the oldest one being tracked, it must be discarded. If newer, then the packet must be validated first using the HMAC before the tracked sequence window will be advanced. The tracked sequence window must also be advanced when it receives an update ValidSequences number in a `Key Packet.` It can be discarded once a KeyID is valid. 

### Security Considerations

* As of this writing, security experts recommend using DHE-RSA with forward secrecy to exchange keys, and there has been a strong push to move to elliptical curve asymmetric ciphers. However RSA is the only supported method for the following reasons: 
  * Using DHE is not a technically viable option since it requires a bi-directional communications channel
  * The industry hasn't reached a consensus on the best elliptical curves to use. 
  * Elliptical curve cartography is not as widely supported as RSA on software platforms.
  * Elliptical curve signature validation is on the order of 30 times slower than RSA validation and the strongest Denial of Service attack for this protocol is at the point of signature validation.
  * The main concern with RSA is factoring using a quantum computer, however, the protocol does not expose the public key or the exponent as part of the handshake. 

* Security experts are also moving to Authenticated Encryption and away from CBC and CTR. This is primarily due to the speed at which AES-GCM executes, and the fact that CBC is very difficult to properly implement. However, AES-GCM is not supported by Microsoft's .NET platform and the speed improvements are note likely to be significant. This may be added at a future date, but will not exists for Version 1 of the protocol.

* For multicast streams, all receivers must be provided with the same cipher information. Since data packets are authenticated using an HMAC, this means that anyone with the cipher information can impersonate the sender. Therefore all receivers of a multicast stream should be trusted entities with similar security levels.

* When using a CTR based cipher, the contents can easily be forged, therefore a strong HMAC is desired for untrusted environments. If using CBC, a successful forgery will likely result in a parsing error that will terminate the connection. Therefore a secure HMAC is more critical for CTR.

* Since CTR packets don't incorporate padding, the length of the encrypted data will be leaked. This may or may not pose a creditable threat. With CBC, padding results will add anywhere from 1 to 16 bytes, keeping the packet length somewhat obscure. 

* The safest way to protect the sender against a DoS Attack is by using UDP, however, this opens up additional DoS attack risks for the receiver of this data.

* From a denial of service perspective, since UPD packets are extremely easy to forge, care should be taken when sending this information through an untrusted environment such as the Internet. A hardware assisted DoS solutions can provide a more targeted protection when using TCP and thus using TCP might be preferred. 

### Other Considerations

* While the upper bounds of the RSA key is not limited, at 4096-bit the packet size is increased to about 1KB. This is getting close to the boundaries of an un-fragmented packet for some networks. At 8192-bit, this would exceed the typical maximum packet size and some networks do not transport fragmented UDP packets.