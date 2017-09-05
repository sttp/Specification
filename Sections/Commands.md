### Commands

This section defines the STTP command channel functions. These functions always expect a response.

| Code | Command | Source | Response | Description |
|:----:|---------|:------:|:--------:|-------------|
| 0x00 | [Negotiate Session](#negotiate-session-command) | Publisher | Yes | Starts session negotiation of operational modes. |
| 0x01 | [Metadata Refresh](#metadata-refresh-command) | Subscriber | Yes  | Requests publisher send updated metadata. |
| 0x02 | [Subscribe](#subscribe-command) | Subscriber | Yes | Defines desired set of data points to begin receiving. |
| 0x03 | [Unsubscribe](#unsubscribe-command) | Subscriber | Yes | Requests publisher terminate current subscription. |
| 0x04 | [Secure Data Channel](#)  | Subscriber | Yes | Requests publisher secure the data channel.  |
| 0x05 | [Signal Mapping](#signal-mapping-response) | Publisher | No | Response contains data point Guid to run-time ID mappings. |
| 0x06 | [Data Point Packet](#data-point-packet-response) | Publisher | No | Response contains data points. |
| 0x0n | etc. | | | |
| 0xFF | [NoOp](#noop-command) | Both | Yes | Periodic message to allow validation of connectivity. |

#### Negotiate Session Command

After a successful connection has been established, the publisher and subscriber will participate in a set of initial set of negotiations that will determine the operational modes of the session. The negotiation happens with the `Negotiate Session` command code which will be the first command sent after a successful connection.  The command is sent before any other commands or responses are exchanged so that the "ground-rules" for the communications session can be established. The rule for this operational mode negotiation is that once these modes have been established, they will not change for the lifetime of the connection.

Immediately after connecting the publisher will start the negotiation process by sending the `Negotiate Session` command to the subscriber that will contain information on the available operational modes that the publisher supports. The subscriber will be waiting for this initial publisher command, if the subscriber does not receive the command in a timely fashion (time interval controlled by configuration), the subscriber will disconnect.

Session negotiation is a multi-step process with commands being sent by the publisher and responses being sent by the subscriber until negotiation terms are either established or the connection is terminated because terms could not be agreed upon.

##### Protocol Version Negotiation

Since future STTP protocol versions could include different session negotiation options, the first negotiation will always be for the supported protocol versions. The payload of the first `Negotiate Session` command sent by the publisher will be an instance of the `ProtocolVersions` structure, defined as follows, that defines the versions of the STTP protocol that are supported:

```C
struct {
  int count;
  Version[] versions;
}
ProtocolVersions

```

This specification only defines details for version 1.0 of STTP, so the initial `Negotiate Session` command payload from the publisher will be an instance of the `ProtocolVersions` structure with a `count` value of `1` with a single element `versions` array instance where `versions[0].major` is `1` and `versions[0].minor` is `0`.

The subscriber will return with either a `Succeed` or `Failed` response indicating its ability to support the specified protocol versions.

If the subscriber can support one of the protocols specified by the publisher, the `Succeed` response payload will be an instance of the `ProtocolVersions` structure with a `count` of `1` and a single element `versions` array instance that indicates the protocol version to be used.

If the subscriber cannot support one of the protocols specified by the publisher, the `Failed` response payload will be an instance of the `ProtocolVersions` structure filled out with the supported protocols. In case of failure, both the publisher and subscriber should start connection termination sequences since no protocol version could be agreed upon.

##### Operational Modes Negotiation

If the protocol version negotiation succeeds for version `1.0` of STTP, the next negotiation will be for desired operational modes. The payload of the second `Negotiate Session` command sent by the publisher will be an instance of the `OperationalModes` structure, defined as follows, that will define the supported string encodings, supported stateful and stateless compression algorithms and if UDP broadcasts will be allowed:

```C
enum {
  ASCII = 1 << 0,
  ANSI = 1 << 1,
  UTF8 = 1 << 2,
  Unicode  = 1 << 3
}
Encodings

struct {
  Encodings encodings;
  uint16 udpPort;
  NamedVersions statefulCompressionAlgorithms;
  NamedVersions statelessCompressionAlgorithms;
}
OperationalModes
```

The `encodings` property of the `OperationalModes` defines a set of string encodings supported by the publisher, this is a bit flag that indicates the supported string encodings.

The publisher uses the `udpPort` property to indicate its willingness to support UDP based publications to the subscriber. A value of zero indicates that no UDP broadcasts will be supported and any non-zero value indicates that UDP broadcasts will be supported.

#### Metadata Refresh Command

* Wire Format: Binary
  * Includes current metadata version number

#### Subscribe Command

* Wire Format: Binary
  * Includes metadata expression and/or individual Guids for desired data points

#### Unsubscribe Command

  * Wire Format: Binary

#### Secure Data Channel

  * Wire Format: Binary

#### Data Point Packet Response

* Wire Format: Binary
  * Includes a byte flag indicating content, e.g.:
    * Data compression mode, if any
    * Total data points in packet
  * Includes serialized data points

:information_source: The data point packet is technically classified as a response to a `subscribe` command. However, unlike most responses that operate as a sole response to a parent command, data-packet responses will continue to flow for available measurements until an `unsubscribe` command is issued.

#### Signal Mapping Response

* Wire Format: Binary
  * Includes a mapping of data point Guids to run-time signal IDs
  * Includes per data point ownership state, rights and delivery characteristic details

#### NoOp Command

No operation keep-alive ping. It is possible for the command channel to remain quiet for some time if most data is being transmitted over the data channel, this command allows a periodic test of client connectivity.

* Wire Format: Binary
