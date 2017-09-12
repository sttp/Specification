## Appendix B - STTP API Reference
The STTP API describes a set of properties and methods for accessing an STTP server. Elements marked with the tag [Required] are required to be provided by all STTP server implementations.
### Core
The Core class contains the basic elements of the API.

* `ConnectionString : string`
    > [Required] returns the connection string of the current connection, or an empty string if no connection is established.
* `Connect(connectionString:string) : void`
    > [Required] establishes a connection to the STTP server. The method will throw an exception if the connection cannot be established.
> :tomato::question: mkd: Should this return an object, an interface or a handle like, for example, the Perl DBI API (ref: https://metacpan.org/pod/DBI#Architecture-of-a-DBI-Application)?  With this architecture the handle could be used for all other methods, and multiple handles could be kept which represent connections to various STTP servers.

* `Disconnect() : void`
    > [Required] terminates a connection.
* `ValidateConnection() : string`
    > [Required] validates whether a connection has been successfully established. Returns the connection string, or an empty string if no connection is established.

### Data
The Data class contains elements for querying and manipulating data points (or measurements, if "measurements" is the right term to describe something that has a PointTag on an STTP server).

* `GetMetaData() : MetaData[0 .. *]`
    > [Required] gets MetaData for the current set of measurements.
* `GetMetaData(id:Guid) : MetaData`
    > [Required] gets MetaData for the measurement specified by id.
* `Subscribe(id:Guid) : bool`
    > [Required] initiates a subscription to the measurement specified by id at the native rate.
* `Subscribe(id:Guid, rate:double, method:ResampleMethod) : Boolean`
    > [Required] initiates a subscription to the measurement specified by id at the delivery rate specified by rate. The underlying measurement shall be resampled using the method prescribed by method, which is a member of the ResampleMethod enumeration.

    > :bulb: Basic resample methods must be mathematically defined in the standard and enumerated. If none of the available resample methods satisfy the subscriber's requirements, then the measurement should be subscribed at the native rate and resampled in the client application.

### Security
The Security class contains elements for querying and manipulating the security features of a connection.

### Utility
The Utility class contains utility methods.

> :bulb: Links to language specific auto-generated XML code comment based API documentation would be useful.

more...
