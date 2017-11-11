### Responses

The following table defines the responses to commands that can be sent by STTP. 

| Code | Type | Source | Description |
|:----:|------|:------:|-------------|
| 0x80 | [GetMetadataSchemaResponse](#get-metadata-schema-response) | Publisher | Sends the schema for the metadata to the Subscriber |
| 0x81 | [GetMetadataResponse](#get-metadata-response) | Publisher | Sends metadata results to the Subscriber. |
| 0x82 | [NegotiateSessionResponse](#negotiate-session-response) | Publisher | Responds to negotiate session commands. |
| 0x83 | [RequestSucceeded](#request-succeeded) | Any | Command request succeeded. |
| 0x84 | [RequestFailed](#request-failed) | Any | Command request failed. Response error payload, if any, included. |

#### Get Metadata Schema Response

Responds with the schema for the metadata

```C
struct {
  MetadataSchema schema;   //The command code that succeeded.
}
GetMetadataSchema;
```

#### Get Metadata Response

Responds with the metadata.

* Subcommands
  * `VersionNotCompatible` - If SchemaVersion does not match the current one, or if revision is too old to do an update query on.
  * `DefineTable` - Defines the response Table.
  * `DefineRow` - Defines a row of the data.
  * `UndefineRow` - For update queries, indicates this row should be removed if it exists.
  * `Finished` - Indicates that the streaming of the table has completed.

#### Negotiate Session Response

Responds to the NegotiateSession command.

* Subcommands
  * `ChangeInstanceSuccess` - Changes the active instance of the connection.
  * `ChangeUdpCipherResponse` - Returns data and agrees to change the UDP cipher.
  * `DesiredOperation` - Reply to SupportedFunctionality, indicates the selected mode of operation.
  * `InstanceList` - The list of all instances this server has.
  * `ReverseConnectionSuccess` - Transfers the role of server to the client.

#### Request Succeeded

A response with a type `Succeeded` is intended to represent a successful reply for a command function. See associated [command code](Commands.md#commands) for proper response.

```C
struct {
  CommandCode command;     //The command code that succeeded.
  string Reason;           //A user friendly message for the success, can be null.
  string Details;          //A not so friendly message more helpful for troubleshooters.
}
RequestSucceeded;
```

#### Request Failed

A response with a type `Failed` is intended to represent a failure reply for a command function. See associated [command code](Commands.md#commands) for proper response.

```C
struct {
  CommandCode command;       //The command code that failed.
  bool TerminateConnection;  //Indicates that the connection should be terminated for a failure.
  string Reason;             //A user friendly message for the failure, can be null.
  string Details;            //A not so friendly message more helpful for troubleshooters.
}
RequestSucceeded;
```