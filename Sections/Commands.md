### Commands

All commands must be sent over the command channel.

| Code | Command | Source | Description |
|:----:|---------|:------:|-------------|
| 0x00 | [Set Operational Modes](#set-operational-modes-command) | Subscriber | Defines desired set of operational modes. |
| 0x01 | [Metadata Refresh](#metadata-refresh-command) | Subscriber | Requests publisher send updated metadata. |
| 0x02 | [Subscribe](#subscribe-command) | Subscriber | Defines desired set of data points to begin receiving. |
| 0x03 | [Unsubscribe](#unsubscribe-command) | Subscriber | Requests publisher terminate current subscription. |
| 0x0n | etc. | | | |
| 0xFF | [NoOp](#noop-command) | Any | Periodic message to allow validation of connectivity. |

#### Set Operational Modes Command

This must be the first command sent after a successful connection - the command must be sent before any other commands or responses are exchanged so that the "ground-rules" for the communications session can be established. The rule for this operational mode negotiation is that once these modes have been established, they will not change for the lifetime of the connection.

The subscriber must send the command and the publisher must await its reception. If the publisher does not receive the command in a timely fashion (time interval controlled by configuration), it will disconnect the subscriber.

> :information_source: In modes of operations where the publisher is initiating the connection, the publisher will still be waiting for subscriber to initiate communications with a `Set Operational Modes` command.

* Wire Format: Binary
* Requested operational mode negotiations
  * String encoding
  * Compression modes
  * UDP data channel usage / port

#### Metadata Refresh Command

* Wire Format: Binary
  * Includes current metadata version number

#### Subscribe Command

* Wire Format: Binary
  * Includes metadata expression and/or individual Guids for desired data points

#### Unsubscribe Command

  * Wire Format: Binary

#### NoOp Command

No operation keep-alive ping. It is possible for the command channel to remain quiet for some time if most data is being transmitted over the data channel, this command allows a periodic test of client connectivity.

* Wire Format: Binary
