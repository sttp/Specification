## UDP Encryption

If desired, it is possible to transport sttp over UDP. Currently the only supported method for transporting data over UDP is with a 1 way communications channel. This allows for communications paths that are one-to-one or one-to-many. If a 2 way communications channel is desired, a separate TCP connection will need to be established to accommodate the feedback loop.

> :information_source: For multicast streams, All of the recipients will need to share the same private key. Since all entities will know the cipher data for the stream, any one of them could forge a packet. Therefore all recipients of a multicast stream need to be trusted.

The primary driver for this need is to support the secure transport of data from a higher security environment to a lower one. Since there will not be a feedback loop, the server will have to make the determination on how to send metadata and data points to the client. One example could be: The entire metadata set is sent once per hour, a metadata delta is sent once per minute, and the real-time stream is sent as it comes in. 

### Cipher State

Since the data stream will be encrypted, the following state information is necessary to decrypt the cipher stream. 

```C
struct {
  int16 EpicID;          //This will serve as a lookup identifier for the data stream
  int64 Valid After;     //Indicate when this cipher is valid for.
  int64 Valid Before;    //The Expire timestamp
  byte[16] IV;           //A 128 bit initialization vector for the AES Encryption
  byte[32] AES KEY;      //A 256 bit encryption key.
  byte[64] HMAC KEY;     //A 512 bit key for the HMAC (The recommended size for HMAC-SHA-256)
}
CipherState;
```

This data can be transmitted in one of two ways. If a hybrid TCP/UDP connection is used, this cipher data will be transmitted over the TCP channel. If UDP Only is used, this will be transmitted from the server to the client on a periodic basis. 

> :information_source: The size of this key exhcange packet depends on the RSA key strenght, but will be on the order of 1KB. Sending this packet every 1 second isn't a terrible idea, however, once per minute, or once every 15 seconds is probably more reasonable. 

### Key Exchange Packet

Before a secure key exchange packet can be created, the server and the client must both exchange a public key. This key must be an RSA key of length 2048-bit or greater. Client's public certificate will be used to encrypt the `CipherState` and the server's private key will be used to sign the packet.

> :information_source: While the upper bounds of the RSA certificate is not limited, at 4096-bit, the packet size is increated to about 1KB, which is getting close to the boundaries of a fragmented packet limit. Some networks will not transport fragmented UDP packets, so 8192-bit keys won't work.

```C
struct {
  byte[32] Nonce;        //Ensures that the encrypted data is not deterministic.
  byte8 HmacLength;      //The length of the HMAC field in the data packet. { 4, 8, 12, 16, 32 }
  byte[16] IV;           //A 128 bit initialization vector for the AES Encryption
  byte[32] AES KEY;      //A 256 bit encryption key.
  byte[64] HMAC KEY;     //A 512 bit key for the HMAC (The recommended size for HMAC-SHA-256)
}
RSACipherDetails;  //Note, this data is encrypted with the Client's RSA key.

struct {
  int8 Packet Type = 1     //An ID field identifying the packet type.
  int16 EpicID;            //This will serve as a lookup identifier for the data stream
  int64 Valid After;       //Indicate when this cipher is valid for.
  int64 Valid Before;      //The Expire timestamp
  int16 CipherBlockLength  //The length of the encrypted block
  RSACipherDetails Cipher  //A 256 byte field contains the RSA encrypted cipher details.
  int16 SignatureLength    //The length of the signature.
  byte[256] Signature      //SHA512-RSA digital signature of entire packet minus the signature length. (Using the server's private key). 
}
KeyExchangePacket;
```

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



