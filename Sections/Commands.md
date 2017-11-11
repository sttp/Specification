### Commands

The following table defines the commands available to STTP. Commands that expect a response define the command channel functions, those that do not define the data channel functions.

| Code | Command | Source | Response | Description |
|:----:|---------|:------:|:--------:|-------------|
| 0x01 | [BeginFragment](#begin-fragment-command) | Both | No | Indicates a large packet is being sent. |
| 0x02 | [NextFragment](#next-fragment-command) | Both | No | The next fragment of a large packet. Follows `BeginFragment`. |
| 0x03 | [GetMetadataSchema](#get-metadata-schema-command) | Subscriber | Yes | Requests the database schema and version of the metadata. |
| 0x04 | [GetMetadata](#get-metadata-command) | Subscriber | Yes | Requests specific records of the metadata based on the schema. |
| 0x05 | [Subscribe](#subscribe-command) | Subscriber | Yes | Adds/Removes a desired set of data points that will be received. |
| 0x06 | [SendDataPoints](#send-data-points-command) | Publisher | No | A packet that contains normally encoded data points. |
| 0x07 | [SendDataPointsCustom](#send-data-points-custom-command) | Publisher | No | A packet that contains specially encoded data points. |
| 0x08 | [RuntimeIDMapping](#runtime-id-mapping-command) | Publisher | Yes | Defines runtimeIDs for DataPointIDs. |
| 0x09 | [NegotiateSession](#negotiate-session-command) | Publisher | Yes | Establishes session roles and supported features for a connection. |
| 0x0A | [BulkTransport](#bulk-transport-command) | Publisher | No | For sending large buffers, like files. |
| 0xFF | [NoOp](#noop-command) | Both | Yes | Periodic message to allow validation of connectivity. |


#### Begin Fragment Command

If sending a packet that is larger than the negotiated maximum packet size, it must be fragmented. This command is the first in a series of fragment commands that define the entire fragment. 

If the session supports it, fragmented data is commonly compress. It's possible that a compressed data fits into a single fragment, therefore this command will not be followed by subsequent `NextFragment` commands. 

Fragmented packets must be sent one at a time in sequence and cannot be interwoven with any other kind of command.

```C
struct {
  int32 totalFragmentSize;          //The size of all fragments of the fragmented packet
  int32 totalRawSize;               //The uncompressed size of all of the compressed segments
  int8 commandCode;                 //The CommandCode of the data that is fragmented
  int8 compressionMode;             //The compression algorithm that compressed this packet. Can be None.
  //(uint16) lengthOfFirstFragment  //This field is not specified and is implied from the packet header. Packet Length - 13
  uint8[] firstFragment             //This is the first fragment of the data.
}
BeginFragmentCommand;
```

#### Next Fragment Command

This packet always follows `BeginFragment` and will be repeated in order until all of the data has been transmitted. 

There is not a Finished command, therefore, once the total number of bytes have been transmitted as defined in `BeginFragment`. The command has completed. 

```C
struct {
  //(int32) offset            //This is implied. It's the total number of bytes that have been received thus far.
  //(int32) lengthOfFragment  //This field is implied. Packet Length - 3.
  uint8[] fragment            //The next fragment of the sequence.
}
NextFragmentCommand;
```

#### Get Metadata Schema Command

Requests that the current version of the metadata database be sent, along with the schema. While this information is not required, 
it's important to know this when checking if one's metadata is out of synchronization or if additional user defined metadata tables exist.

```C
struct {
  bool includeSchema   //Without this set, the response will only include the database version and not the schema.
}
GetMetadataSchemaCommand;
```

#### Get Metadata Command

Requests specific tables of metadata. If supported by the connection, custom queries and filters can be also be specified as part of the metadata request. There is only permitted one table per request.

```C
struct {
  guid schemaVersion          //If not Guid.Empty, is used to verify that the current schema has not changed.
  int64 revision              //If isUpdateQuery=true, the query returns all changes since the specified revision
  bool isUpdateQuery          //specifies if this query should only return the deltas, of the entire metadata result
  SttpQueryExpresssion query  //The query itself. EX: SELECT * FROM Table where Column = 1234
}
GetMetadataCommand;
```

The results for this command are streamed and can be broken into multiple packets if needed.


#### Subscribe Command

Updates the subscription for new measurements. This update can be to add, remove, or replace an existing subscription.

This command is broken up into sub commands that can be combined into a single packet. The sub commands include:

* Subcommands
  * `ConfigureOptions` - Defines options for the measurements about to be selected. Such as priority; dead-banding; start/stop times; sample resolution.
  * `AllDataPoints` - Subscribes to everything
  * `DataPointByID` - Specifies individual data points
  * `ByQuery` - Specifies some kind of query to use to select the measurements.

```C
enum {
  Replace,
  Remove,
  Append,
}
SubscriptionMode;
```

```C
struct {
  SubCommand ConfigureOptions
  SubscriptionMode mode
  SttpNamedSet options  //A set of options for the points about to be specified.
}
ConfigureOptions;
```

```C
struct {
  SubCommand AllDataPoints
  SubscriptionMode mode
}
AllDataPoints;
```

```C
struct {
  SubCommand DataPointByID
  SubscriptionMode mode
  SttpPointID[] points       //An array of points.
}
DataPointByID;
```

```C
struct {
  SubCommand ByQuery
  SubscriptionMode mode
  SttpQueryExpression query       //A query that specifies the points to use. The columns specified in the query must be SttpPointID
}
ByQuery;
```

Some examples of what can be exchanged in the ConfigureOptions include these items.

Signal mapping structures:

```C
enum {
  Level0 = 0, // User level 0 priority, lowest
  Level1 = 1, // User level 1 priority
  Level2 = 2, // User level 2 priority
  Level3 = 3, // User level 3 priority
  Level4 = 4, // User level 4 priority
  Level5 = 5, // User level 5 priority
  Level6 = 6, // User level 6 priority, highest
  Level7 = 7  // Reserved system level priority
}
Priority; // 3-bits

enum {
  Latest = 0,       // Data down-sampled to latest received
  Closest = 1,      // Data down-sampled to closest timestamp
  BestQuality = 2,  // Data down-sampled to item with best quality
  Filter = 3        // Data down-sampled with DataType specific filter, e.g., average
}
ResolutionType; // 2-bits

enum {
  Timestamp = 1 << 0;           // When set, State includes Timestamp
  TimeQuality = 1 << 1,         // When set, State includes TimeQualityFlags
  DataQuality = 1 << 2,         // When set, State includes DataQualityFlags
  Sequence = 1 << 3,            // When set, State includes sequence ID as uint32
  Fragment = 1 << 4,            // When set, State includes fragment number as uint32
  PriorityMask = 0xE0,          // Mask for Priority, value = (flags >> 5) & 0xE
  Reliability = 1 << 8,         // When set, data will use lossy communications
  Verification = 1 << 9,        // When set, data delivery will be verified
  Exception = 1 << 10,          // When set, data will be published on change
  Resolution = 1 << 11,         // When set, data will be down-sampled
  ResolutionTypeMask = 0x3000,  // Mask for ResolutionType, value = (flags >> 12) & 0x2
  KeyAction = 1 << 14,          // When set key is to be added; otherwise, removed
  ReservedFlag = 1 << 15        // Reserved flag
}
StateFlags; // sizeof(uint16), 2-bytes
```

#### Send Data Points Command

Data point packet commands are sent without the expectation of a response, as such data point packets can be transmitted over a lossy communications protocol, e.g., UDP, and thus are suitable for data channel functionality.

Detailed serialization of this packet is described in a different section. However, the general form of the structure looks like the following.

```C
struct {
  SttpDataPoint[] points     
}
SendDataPoints;
```

There are other custom encoding methods that can be optionally supported, but this encoding method is designed to catch all encoding cases.


> :information_source: The data point packet commands are sent continuously after a successful `subscribe` command and will continue to flow for available measurements until a `subscribe` that unsubscribes from all measurements is issued.

#### Send Data Points Custom Command

A number of custom encoding methods will be supplied that will optimize encoding for special cases. These are specified in the appendix. These encoding methods are optional and are negotiated during the Negotiate Sesssion stage.

```C
struct {
  byte encodingMethod     
  byte[] data
}
SendDataPointsCustom;
```


#### Runtime ID Mapping Command

Identifies which DataPointIDs are mapped to runtime IDs. Not all DataPointIDs must be mapped to runtimeIDs, however, the exact number that can be mapped are identified during the Negotiate Session phase.

```C
struct {
  SttpPointID[] points
}
RuntimeIDMapping;
```

#### Negotiate Session Command

After a successful connection has been established, the publisher and subscriber shall participate in an initial set of negotiations that will determine the STTP protocol version and operational modes of the session. The negotiation happens with the `NegotiateSession` command code which must be the first command sent after a successful publisher/subscriber connection. The command is sent before any other commands or responses are exchanged so that the "ground-rules" for the communications session can be established. Once the session negotiations for the protocol version and operational modes have been established they must not change for the lifetime of the session.

Session negotiation is a multi-step process with commands and responses being sent by the publisher and subscriber until negotiation terms are either established or the connection is terminated because terms could not be agreed upon.

This command is broken up into sub commands. The sub commands include:

* Subcommands
  * `InitiateReverseConnection` - The connecting client desires to act as the server.
  * `GetAllInstances` - Request all named instances on the server.
  * `ChangeInstance` - Requests to change the instance connected to.
  * `SupportedFuncationality` - Tell the server what functions/versions are supported by your client.
  * `ChangeUdpCipher` - Indicates that the UDP cipher needs to be changed.


##### Protocol Version Negotiation

>TODO: This has changed, but functionally still exists in the `SupportedFunctionalty` command.

Future STTP protocol versions can include different session negotiation options, so the first session negotiation step is always to establish the protocol version to use. Immediately after connecting, the publisher must start the protocol version negotiation process by sending the `NegotiateSession` command to the subscriber that shall contain information on the available protocol versions that the publisher supports. The subscriber shall be waiting for this initial publisher command; if the subscriber does not receive the command in a timely fashion (time interval controlled by configuration), the subscriber should disconnect.

The payload of the first `NegotiateSession` command sent by the publisher shall be an instance of the `ProtocolVersions` structure, defined as follows, that iterates the versions of the STTP protocol that are supported:

```C
struct {
  uint8 count;
  Version[] versions;
}
ProtocolVersions;

```
- The `count` field defines the total number of elements in the `versions` field array.
- The `versions` field is an array of [`Version`](Definitions.md#version-structure) structures.

Since the current version of this specification only defines details for version 1.0 of STTP, the initial `NegotiateSession` command payload from the publisher shall be an instance of the `ProtocolVersions` structure with a `count` value of `1` and a single element `versions` array where `versions[0].major` is `1` and `versions[0].minor` is `0`.

When the first `NegotiateSession` command is received from the publisher, the subscriber must send either a `Succeeded` or `Failed` response for the `NegotiateSession` command indicating its ability to support one of the specified protocol versions.

If the subscriber can support one of the protocols specified by the publisher, the `Succeeded` response payload shall be an instance of the `ProtocolVersions` structure with a `count` of `1` and a single element `versions` array that indicates the protocol version to be used.

If the subscriber cannot support one of the protocols specified by the publisher, the `Failed` response payload shall be an instance of the `ProtocolVersions` structure filled out with the supported protocols. In case of failure, both the publisher and subscriber should terminate the connection since no protocol version could be agreed upon.

When a `Succeeded` response for the first `NegotiateSession` command is received from the subscriber, the publisher should validate the subscriber selected protocol version. If the publisher does not agree with the protocol version selected by the subscriber, the publisher shall send a `Failed` response for the `NegotiateSession` command with an empty payload and terminate the connection since no protocol version could be agreed upon. If the publisher accepts the subscriber selected protocol version, the negotiation will continue with the selection of operational modes.

After sending a `Succeeded` response to the first `NegotiateSession` command, the subscriber shall be waiting for either a `Failed` response from the publisher or the second `NegotiateSession` command; if the subscriber does not receive a command or response in a timely fashion (time interval controlled by configuration), the subscriber should disconnect.

##### Operational Modes Negotiation

>TODO: This has changed, but functionally still exists in the `SupportedFunctionalty` command.

For version `1.0` of STTP, if the protocol version negotiation step succeeds, the next negotiation will be for the desired operational modes. The payload of the second `NegotiateSession` command sent by the publisher shall be an instance of the `OperationalModes` structure, defined as follows, that iterates the supported string encodings, whether UDP broadcasts are allowed and the available stateful and stateless compression algorithms (see [compression algorithms](Compression.md)):

```C
struct {
  uint16 udpPort;
  NamedVersions stateful;
  NamedVersions stateless;
}
OperationalModes;
```
- The `udpPort` field meaning depends on the usage context:
  - When sent with the publisher command payload, field is used to indicate publisher support of UDP. A value of zero indicates that UDP broadcasts are not supported and any non-zero value indicates that UDP broadcasts are supported.
  - When sent with the subscriber response payload, field is used to indicate the desired subscriber UDP port for data channel functionality. A value of zero indicates that a UDP connection should not be established for subscriber data channel functionality.
- The `stateful` field defines the [`NamedVersions`](Defintions.md#namedversions-structure) representing the algorithms to use for stateful compression operations.
- The `stateless` field defines the [`NamedVersions`](Defintions.md#namedversions-structure) representing the algorithms to use for stateless compression operations.

When the second `NegotiateSession` command is received from the publisher, the subscriber shall send either a `Succeeded` or `Failed` response for the `NegotiateSession` command indicating its ability to support a subset of the specified operational modes.

If the subscriber can support a subset of the operational modes allowed by the publisher, the `Succeeded` response payload shall be an instance of the `OperationalModes` structure with the specific values for the `encodings`, `udpPort`, `stateful` and `stateless` fields. The `encodings` field should specify a single flag designating the string encoding to use and both the `stateful` and `stateless` fields should define a `count` of `1` and a single element array that indicates the [compression algorithm](Compression.md) to be used where a named value of `NONE` with a version of `0.0` indicates that no compression should be used.

If the subscriber cannot support a subset of the operational modes allowed by the publisher, the `Failed` response payload shall be an instance of the `OperationalModes` structure filled out with the supported operational modes. In case of failure, both the publisher and subscriber should terminate the connection since no protocol version could be agreed upon.

When a `Succeeded` response for the second `NegotiateSession` command is received from the subscriber, the publisher should validate the subscriber selected operational modes. If the publisher does not agree with the operational modes selected by the subscriber, the publisher shall send a `Failed` response for the `NegotiateSession` command with an empty payload and terminate the connection since no operational modes could be agreed upon. If the publisher accepts the subscriber selected operational modes, then the publisher shall send a `Succeeded` response for the `NegotiateSession` command with an empty payload and the publisher will consider the session negotiations to be completed successfully.

After sending a `Succeeded` response to the second `NegotiateSession` command, the subscriber shall be waiting for either a `Succeeded` or `Failed` response from the publisher; if the subscriber does not receive a response in a timely fashion (time interval controlled by configuration), the subscriber should disconnect.

If the subscriber receives a `Succeeded` response for the `NegotiateSession` command from the publisher, the subscriber will consider the session negotiations to be completed successfully.

Once operational modes have been established for a session, the publisher and subscriber must exchange any string based payloads using the negotiated string encoding as specified by the subscriber.

##### Secure Data Channel

When data channel functions that are operating over a lossy communications protocol, e.g., UDP, and command channel functions are operating over a reliable communications protocol, e.g., TCP, that has been secured with TLS, then the subscriber can request that data channel functions can be secured by issuing a `SecureDataChannel` command.

The `SecureDataChannel` command should only be issued when a lossy communications protocol, e.g., UDP, has been defined for data channel functions. If a subscriber issues the `SecureDataChannel` command for a session that has not defined a lossy communications protocol for data channel functions, the publisher shall send a `Failed` response for the `SecureDataChannel` command with a string based payload that indicates that data channel functions can only be secured when a lossy communications protocol has been established. This error condition should equally apply when UDP broadcasts are not supported by the publisher.

The `SecureDataChannel` command should only be issued when command channel functions are already secured using TLS. If a subscriber issues the `SecureDataChannel` command for a session with a command channel connection that has not been secured using TLS, the publisher shall send a `Failed` response for the `SecureDataChannel` command with a string based payload that indicates that data channel functions can only be secured when command channel functions are already secured using TLS.

The `SecureDataChannel` command should be issued prior to the `Subscribe` command to ensure data channel functions are secured before transmission of `DataPointPacket` commands. If a subscriber issues the `SecureDataChannel` command for a session that already has an active subscription, the publisher shall send a `Failed` response for the `SecureDataChannel` command with a string based payload that indicates that data channel functions cannot be secured after a subscription has already been initiated.

If data channel functions can be secured, the publisher shall send a `Succeeded` response for the `SecureDataChannel` command with a payload that shall be an instance of the `DataChannelKeys` structure, defined as follows, that establishes the symmetric encryption keys and associated initialization vector used to secure the data channel:

```C
struct {
  uint16 nonceLength;
  uint8[] nonce;
}
ChangeUdpCipher;
```

> ToDO: We also need a way to send the encryption key if UDP only.

- Both the server and the client specify a random number to prevent the key from being repeated or set to 000's
- The `key` field is a byte array computed from SHA256(ServerNonce || ClientNonce).
- The `iv` field is the first 16 bytes of the byte array computed from SHA256(ClientNonce || ServerNonce).

Upon the publisher sending the `Succeeded` response for the `SecureDataChannel` command, all data function payloads for commands and responses sent by the publisher to the subscriber over the lossy communications protocol must be encrypted using the AES symmetric encryption algorithm with a key size of 256 using the specified subscriber key and initialization vector.

After sending a `SecureDataChannel` command to the publisher, the subscriber shall be waiting for either a `Succeeded` or `Failed` response from the publisher; if the subscriber does not receive a response in a timely fashion (time interval controlled by configuration), the subscriber should disconnect.

If the subscriber receives a `Failed` response for the `SecureDataChannel` command from the publisher, the subscriber should disconnect.

> :wrench: Failure responses from the publisher will either be from a configuration mismatch or an order of operations issue, STTP implementations should make subscribers aware of the possible exception causes so that the issue can be corrected.

Upon reception of a `Succeeded` response for the `SecureDataChannel` command from the publisher, the subscriber must take the received key and initialization vector and decrypt each payload received over the lossy communications protocol using the AES symmetric encryption algorithm with a key size of 256.

> :wrench: It is presumed that communications over a lossy communications protocol, e.g., UDP, will flow from the publisher to the subscriber. If an implementation of STTP is ever established such traffic would flow from the subscriber to the publisher over a lossy communications channel, then to be secured, this traffic would need to be encrypted by the subscriber and decrypted by the publisher.



#### Unsubscribe Command

>TODO: This command has been replaced with a Subscripe, Remove, All command.

The subscriber shall issue an `Unsubscribe` with an empty payload to stop any existing data subscription.

Upon reception of the `Unsubscribe` command from a subscriber, the publisher must immediately cease publication of `DataPointPacket` commands to the specific subscriber that issued the command; also, the publisher shall send a `Succeeded` response for the `Unsubscribe` command with an empty payload. If for any reason the publisher cannot terminate the subscription, the publisher shall send a `Failed` response for the `Unsubscribe` command with a string based payload that describes the reason the subscription cannot be terminated.

After sending an `Unsubscribe` command to the publisher, the subscriber shall be waiting for either a `Succeeded` or `Failed` response from the publisher; if the subscriber does not receive a response in a timely fashion (time interval controlled by configuration), the subscriber should disconnect and not attempt to send further commands to stop the data subscription.

If the subscriber receives a `Failed` response for the `Unsubscribe` command from the publisher, the subscriber should disconnect and not attempt to send further commands to stop the data subscription.

Upon reception of a `Succeeded` response for the `Unsubscribe` command from the publisher, the subscriber should consider any cached signal mapping previously received from the publisher to now be invalid - accordingly any allocated memory for the cache should now be released.

> :wrench: With reception of the `Succeeded` response for the `Unsubscribe` command the subscriber can be assured that the publisher has stopped sending further `DataPointPacket` commands, however, STTP implementations should anticipate that some data packets could still arrive depending on how much data was already queued for transmission. This may be more evident when a lossy communications protocol, e.g., UDP, is being used for data channel functionality and the `Succeeded` response for the `Unsubscribe` command is received on a reliable communications protocol, e.g., TCP.


#### Bulk Transport Command

This command has the ability of sending large blocks of data over STTP.

This command is broken up into sub commands. The sub commands include:

* Subcommands
  * `BeginSend` - Indicates a new large block of data is on its way.
  * `SendFragment` - Indicates that a new fragment of data is being sent.
  * `CancelSend` - Indicates that a send operation is being canceled.


#### NoOp Command

When data channel functions are operating over a lossy communications protocol, e.g., UDP, and command channel functions are operating over a reliable communications protocol, e.g., TCP, then command channel activity may remain quiet for some time. To make sure the connection for the command channel is still established the `NoOp` command allows for a periodic test of connectivity.

The `NoOp` command shall be initiated by either the publisher or subscriber. For this functional description the initiator of the command will be called the _sender_, whereby the other party will be the _receiver_. The `NoOp` command is always sent with an empty payload and is designed to be sent over a reliable communications channel, e.g., TCP, on a configurable schedule.

Upon reception of the `NoOp` command from a sender, the receiver shall send a `Succeeded` response for the `NoOp` command with an empty payload.

After sending a `NoOp` command to the receiver, the sender shall be waiting for a `Succeeded` response from the receiver; if the sender does not receive a response in a timely fashion (time interval controlled by configuration), the sender should disconnect. If the sender uses a client-style socket, the sender should reestablish the connection cycle.

Upon reception of a `Succeeded` response for the `NoOp` command from the receiver, the sender should consider the connection valid and reset the timer for the next `NoOp` test.

> :wrench: For implementations of STTP the `NoOp` command will be used to test that the reliable communications channel is still available. Implementations will check for exceptions that occur during transmission of the command as well as timeouts due to lack of responses, in either case the communications channel can be considered failed and placed back into a connection cycle state.
