## Appendix B - STTP API Reference

test II - from Atom editor

The STTP API describes a set of properties and methods for accessing an STTP server. Elements marked with the tag [Required] are required to be provided by all STTP server implementations.  

:question: @StevenChisholm - please validate the accuracy / implementability of the following as compared to `TestImplementation`...

### Core


The Core class contains the basic elements of the API.

* `ConnectionString (handle : *handle): string`
    > [Required] returns the connection string of the current connection, or an empty string if no connection is established.

* `Connect(connectionString:string : String, SLL : Boolean, Certificate : X509CertificateClass ) : *handle`
    > [Required] establishes a connection to the STTP server.     SLL is True or false, if SLL is marked as TRUE then certificate must be provided.  Upon successful connection it will provide a a pointer to the handle used to describe this connection.  The method will throw an exception if the connection cannot be established.


* `Disconnect(handle : *handle) : void`
    > [Required] terminates a connection.  The communication path will be tore down and no traffic is guaranteed to be sent after a disconnect from either the server or the client.

* `ValidateConnection() : string`
    > [Required] validates whether a connection has been successfully established. Returns the connection string, or an empty string if no connection is established.

### Data

The Data class contains elements for querying and manipulating data points or the associated metadata.


#### Metadata Definition

Metadata is information that describes the measurements or the relationship between measurements. The party who is sending the data is allowed to modify the metadata. The ability to write data to the metadata repository is controlled by the security access. Any connection that does not have an SSL security certificate will default to sending party can modify and receiving party is read only.  The methods defined in this section are only available if rights are granted to modify metadata repository.

* `AddTable (TableName : String) : Void`
    > [Required] allows for a new metadata definition table to be created. This method will raise an error if table is not created.     (illegal tablename, name already exists, permissions do not allow modification)

*  `RemoveTable (TableName : String) : Void`
    > [Required] removes a table from the metadata repository This method will raise an error if table is not created.     ( table name does not exists or permissions do not allow modification)


* `AddField (TableName : String, FieldName : String, DataType ) : Void`
    > [Required] allows for a new metadata definition field to be added to an existing table . This method will raise an error if table is not created.     (table does not exist, illegal fieldname, name already exists, permissions do not allow modification)

*  `RemoveField (TableName : String)`
    > [Required]  removes a field  from the metadata repository This method will raise an error if table is not created.     ( Fieldname does not exist, table name does not exists or permissions do not allow modification)

*  `AddRelationship (Table1, Table2, Field1, Field2, Relationship Type): Void`
    > [Required]  Used to define relationships between fields in different tables.   Currently supports Foreign Key. Field 1 is a foreign key that is looked up in Field2.  This method will raise an error is relationship is not able to be created

*  `AddIndex (TableName : String, FieldName(s) : String, IndexType)`
    > [Optional] removes a table from the metadata repository This method will raise an error if table is not created.     ( table name does not

*  `SetVersion (Version : String)`
    > [Required]  The provider of the metadata is expected to update the version number every time a change is made to metadata.    This is not done automatically as the server side of the connection may be rebuilt due to a server issue and no metadata has changed.

#### Metadata Sharing

Once the Metadata is defined client can then request access to the information.  The methods below describe how metadata is shared


* `GetMetaFormat(handle : *handle) : Integer `
    >STTP supports multiple ways to store its metadata.   Format is the format of the Metadata repository.  This method is used for the client to request the format of the repository from the server.  It can be one of the following integer values

    1. Table Structure
    2. XML Structure (future)
    3. Object Model (future)
    4. No Metadata Structure Defined

    The underlying structure of the wire protocol metadata is Table Structure so in most cases table Structure will provide the best performance.

* `GetMetaVersion(handle : *handle) : Long Integer `
    >Each time a change is made to the metadata the version is incremented.  This method returns the ...

 * `GetMetaDataTableList(handle : *handle, Filter : String) : String[0...*]`
    > Gets a list of the tables available for Metadata (tables may not have any rows, this method will return tables with zero rows) This method will return all tables plus the special table "Table_Relations. Filter syntax: FILTER TableName WHERE Expression [ORDER BY SortField]


 * `GetMetaDataFieldList(handle : *handle, TableName : String) : String[0...*]`
    > Gets a list of the fields available for a table in the metadata repository.  This method will return an array of strings that is a JSON formated serialization of FieldName, DataType.  

* `GetMetaData(handle : *handle, filter : String) : MetaData[0 .. *]`
    > [Required] gets MetaData for the current set of measurements.    The metadata can be returned in a number of formats.

* `GetMetaDataDelta(handle : *handle, version : String) : MetaData[0 .. *]`
    > [Required] gets MetaData for the current set of measurements as a delta from the version that is provided.  This method will raise an error if it is not able to fulfull the request.


* `GetMetaDataById(id:Guid) : MetaData`
    > [Required] gets MetaData for the measurement specified by id.

* `CacheMetaData(Status : Boolean, TTL : Int) : Status : Boolean`
    > [optional] [Required] Defines if the Metadata is to be cached or looked up on the server each time. If status = True then TTL is the Time to Live in seconds. It will check if cache is dirty at lease ever TTL seconds. If dirty it will repopulate (which may take longer than the TTL time in very large data sets with small TTLs.  Status by default will be False meaning there is no cache.

* `IsCacheDirty() : Status : Boolean`

> [optional]

* `RefreshCache() : Status : Boolean`

> [optional] forces the cache to be updated.  Used to update in-between TTLs as defined in CacheMetaData TTL or if CacheMetaData is set to false.

* `GetIDFromMetaData(MetaFilter : string) : MetaData[0 .. *]`
    > [optional] gets collection of data IDs that match the filter criteria.  
    >> ** need to define what the nature of the filter is (SQL like?)

* `GetIdsWithUnprocessedData (handle : *handle, MetaFilter : string ) : IDArray id:Guid[0 .. *]`

* `GetData (handle : *handle, Id : Guid)`


* `Subscribe(id:Guid) : Void`
    > [Required] initiates a subscription to the measurement specified by id at the native rate.  Returns True if subscription is successful False otherwise.
    >
* `Subscribe(id:Guid, rate:double, method:ResampleMethod) : Boolean`
    > [Required] initiates a subscription to the measurement specified by id at the delivery rate specified by rate. The underlying measurement shall be resampled using the method prescribed by method, which is a member of the ResampleMethod enumeration.  This method will raise an error if it is unable to subscribe to the provided ID.

* `GetAvailableResampleMethodologies(handle : *handle, id:Guid[0 .. *]) : MetaData[0 .. *]`
    > [Required] gets the resampling rates available for each measurement.

    > :bulb: Basic resample methods must be mathematically defined in the standard and enumerated. If none of the available resample methods satisfy the subscriber's requirements, then the measurement should be subscribed at the native rate and resampled in the client application.

### Publication Priority

1. As Soon as Possible
2. Normal Priority
3. As Able But Within a Timespan
4. As Able And Do Not Send After a TimeSpan
5. Throttled (Maximum of x-Bytes/Second) typically for historical data

Priority is set per measurements. By default a measurement is assigned Normal Priority (2). To change the priority use one of the following methods:

* `SetPublicationPrioirty(handle : *handle, id : Guid, Priority : Integer) : Void`
    > [Required] Sets the priority of the defined measurement to Priority


* `SetPublicationPrioirtyBulk(handle : *handle, filter, Priority : Integer) : Void`
    > [Optional] Sets the pririty of the defined measuremnts for all measurments that are defined by the filter to Priority.

### Security
The Security class contains elements for querying and manipulating the security features of a connection.  All Roles and authentication is done through the use of a X509 certificate.   If the sertivicate is not used, then there are no controls on what data is accessible or what metadata is able to be modified.

* `X509LatestAcceptedVersions (handle : *handle) : Version : String`
    > [Required] sends back a String with latest of the released X509 versions that are supported.  Is it expected to utilize the latest version accepted by both the client and server.

* `X509AcceptedVersions (handle : *handle) : Versions_accepted : Tuple`
    > [Required] sends back a tuple with all versions of the 509 certificate standard that are accepted by the host

* ` SecureConnection (handle : *handle, X509Certificate: X509CertificateClass )`
    > [Required] attempts to secure the communication of all future traffic on utilizing the handle.    The certificate will be used to secure both data and command channels where they are separate sockets.  The method will throw an exception if the connection cannot be established.

* `ModifyMetaDataTableSecurity (handle : *handle, TableName : String, GroupName : String,  Role : String) : Void`
    > [Required] sets access for a defined group of users on a particular table.  Users group is defined in X509 certificate.   By default there all tables in the metadata repository are readable and editable by all users.  If the group name had previously been assigned a role then the curent call of this method will override previous settting assuming it completes successfully.    Security is maintained at a table level.  If some fields in a table need a differnt level of access then a second table should be created to hold the additional dields.  Role can be ReadOnly, ReadWrite, NotVisible. The method will throw an exception if the permission cannot be set.

### Utility
The Utility class contains utility methods.


* `GetMaxFragmentSize() : Integer`
    >Returns the current may size of any message before it is fragmented (defaults to 1500 bytes)

* `SetMaxFragmentSize (MessageSize : Integer) : Void`
    > Allows for setting of the message size.   Should be equal to or smaller the largest size allowed by underlying network for a packet size.  The method will throw an exception if the set is not applied.


> :bulb: Links to language specific auto-generated XML code comment based API documentation would be useful.

more...
