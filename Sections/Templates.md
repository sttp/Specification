## Appendix F - STTP Templates

### Overview
The base STTP protocol can be used for any type of time series data.  However, if every implementation of STTP is unique then sharing metadata in an automated fashion will be unique for each implementation.    In order to assist in standardization of the grouping of data and streamlining the structure of the metadata templates are defined.


A template is a schema that defines how the base metadata will be organized and how the data structure should be sent. Since the STTP was initially designed to support synchrophasor data included below is a conversations about the elements of the PMU template   





Here are some examples of metadata suitable for the electric power industry.

### DataPoint Table

A publisher might try the following DataPoint Table for the power industry.

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| PointID          | Guid    | The GUID associated with the data point. |
| PointTag         | String  | A string based unique identifier. |
| Description      | String  | A description for this measurement |
| ProducerTableName| String  | The name of the table within which the record for the resource that produced this data point resides. |
| ProducerTableID  | Guid    | The primary key for the record within the Producer Table. |
| SignalReference  | String  | A string based unique identifier |
| SignalTypeID     | Integer | A code describing the signal type |
| Adder            | Float   | An adjustment factor |
| Multiplier       | Float   | An adjustment factor |
| Signal Type      | String  | Fixed set of signal types. I.E.: (STAT\|FREQ\|DFREQ\|PM\|PA\|PR\|PI\|ANALOG\|DIGITAL\|CALC) |
| Phase Designation| String  | The phase this field is computed from. Ex: A,B,C,0,+,-
| Engineering Units| String  | The base units of this field. (Ex: Volts, Amps, Watts)
| Engineering Scale| Float   | The scaling factor of these units (Ex: 1, 1000, 1000,000)
| Channel Name     | String  | C37.118 Channel Name. For Digital types, an array of 16 elements are permitted. Array length shall be zero if this is not a C37.118 - derived data point.|
| PositionIndex    | Integer | C37.118 position index in a PMU frame. Zero for non-C37.118 data points. |

### PMU Table (a Resource Table example)

| Attribute Name  | Attribute Value Type | Description |
|:--------------: |:--------------------:|:-----------:|
| ResourceID      | Guid   | The GUID associated with the resource. |
| Acronym         | String | A name of the device. |
| Name            | String | A friendly name of the device |
| SubstationTableName| String | The name of the table within which the record for the substation where this PMU resides. |
| SubstationTableID  | Guid    | The primary key for the record within the substation table. |
| CompanyTableName| String | The name of the table within which the record for the company that owns this PMU. |
| CompanyTableID  | Guid   | The primary key for the record within the company table. |
| Protocol        | String | The protocol the device is communicating with |
| FrameRate       | String | The sample rate |
| FNOM            | String | C37.118 Nominal Frequency |
| IDCODE          | String | C37.118 ID Code |
| STN             | String | C37.118 Station Name |
| Nominal Voltage | Float  | The factor required to convert this voltage to a per unit base. |
| CT Ratio        | Float  | The ratio of a connected CT |
| Rated MVA       | Float  | The nominal rating of this device |
| Vendor          | String | The vendor of this device |
| Model           | String | The model number of this device |
| Equipment Type  | String | The type of equipment this device is monitoring (Ex: Line, Transformer) |
| Serial Number   | String | Serial numbers or other identifying information about this equipment) |
| In Service Date | Date   | The date this device was put in service |
| Out Service Date| Date   | The date this device was removed from service |

### Substation Table (a Resource Table example)

| Attribute Name  | Attribute Value Type | Description |
|:--------------: |:--------------------:|:-----------:|
| ResourceID      | Guid   | The GUID associated with the resource. |
| Name            | String | A friendly name of the substation. |
| Latitude        | Float  | The latitude of the substation. |
| Longitude       | Float  | The location of the substation. |
| TimeZone        | String | The time zone for the substation. |

### Phasor Table (a CDSM Table example)

The existence of this CDSM Table presumes the existence of a 'built-in' CDSM called 'Phasor'. For this example, assume that the Phasor CDSM is comprised of two fields: Magnitude (float) and Angle (float).

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| CDSMID           | Guid   | The GUID associated with an entry in the Phasor CDSM. |
| CDSMTag          | String | A string based unique identifier for the Phasor. |
| Description      | String | A description for this phasor, e.g. 'Smith Substation North Bus Voltage'. |
| IsCurrent        | Bit    | Set if this is a current phasor. |
| VoltAssociation  | Guid   | The ID of the voltage phasor used to compute power. Ignore if IsCurrent is reset. |
| AlternateVolt    | Guid   | An alternate voltage phasor, used when the primary voltage is unavailable. Ignore if IsCurrent is reset. |
| LineTableName    | String | The name of the table within which the record for the line associated with this current phasor resides. Ignore if IsCurrent is reset. |
| LineTableID      | Guid    | The primary key for the record within the line table. Ignore if IsCurrent is reset. |

### VIPair Table (a CDSM example)

The existence of this CDSM Table presumes the existence of a CDSM, 'built-in' or 'user-defined', called 'VIPair'. For this example, assume that the VIPair CDSM is comprised of two fields: Voltage (Phasor CDSM) and Current (Phasor CDSM).

| Attribute Name   | Attribute Value Type | Description |
|:----------------:|:--------------------:|:-----------:|
| CDSMID           | Guid   | The GUID associated with an entry in the VIPair CDSM. |
| CDSMTag          | String | A string based unique identifier for the VIPair. |
| Description      | String | A description for this VIPair, e.g. 'Smith-Jones Line'. |










### Data Point Time Quality Flags - Move to appendix

Data points can also include a `TimeQualityFlags` structure in the serialized state data, defined below, that describes both the timestamp quality, defined with the `TimeQuality` enumeration value, as well as an indication of if a timestamp was not measured with an accurate time source.

The time quality detail is included for devices that have access to a GPS or UTC time synchronization source, e.g., from an IRIG timecode signal. For timestamps that are acquired without an accurate time source, e.g., using the local system clock, the `TimeQuality` value should be set to `Locked` and the `TimeQualityFlags.NoAccurateTimeSource` should be set.

```C
enum {
  Locked = 0x0,                       // Clock locked, Normal operation
  Failure =  0xF,                     // Clock fault, time not reliable
  Unlocked10Seconds = 0xB,            // Clock unlocked, time within 10^1s
  Unlocked1Second = 0xA,              // Clock unlocked, time within 10^0s
  UnlockedPoint1Seconds = 0x9,        // Clock unlocked, time within 10^-1s
  UnlockedPoint01Seconds = 0x8,       // Clock unlocked, time within 10^-2s
  UnlockedPoint001Seconds = 0x7,      // Clock unlocked, time within 10^-3s
  UnlockedPoint0001Seconds = 0x6,     // Clock unlocked, time within 10^-4s
  UnlockedPoint00001Seconds = 0x5,    // Clock unlocked, time within 10^-5s
  UnlockedPoint000001Seconds = 0x4,   // Clock unlocked, time within 10^-6s
  UnlockedPoint0000001Seconds = 0x3,  // Clock unlocked, time within 10^-7s
  UnlockedPoint00000001Seconds = 0x2, // Clock unlocked, time within 10^-8s
  UnlockedPoint000000001Seconds = 0x1 // Clock unlocked, time within 10^-9s
}
TimeQuality; // 4-bits, 1-nibble

enum {
  None = 0,
  TimeQualityMask = 0xF,        // Mask for TimeQuality  
  NoAccurateTimeSource = 1 << 7 // Accurate time source is unavailable
}
TimeQualityFlags; // sizeof(uint8), 1-byte
```

> :construction: The remaining available bits in the `TimeQualityFlags` enumeration could be made to directly map to IEEE C37.118 leap-second flags. Existing IEEE text could then be used to describe the function of these bits if deemed useful:

```C
LeapsecondPending = 1 << 4,   // Set before a leap second occurs and then cleared after
LeapsecondOccurred = 1 << 5,  // Set in the first second after the leap second occurs and remains set for 24 hours
LeapsecondDirection = 1 << 6, // Clear for add, set for delete
```

### Data Point Data Quality Flags - Move to appendix

A set of data quality flags are defined for STTP data point values in the `DataQualityFlags` enumeration, defined as follows:

```C
enum {
  Normal = 0,                 // Defines normal state
  BadTime = 1 << 0,           // Defines bad time state when set
  BadValue = 1 << 1,          // Defines bad value state when set
  UnreasonableValue = 1 << 2, // Defines unreasonable value state when set
  CalculatedValue = 1 << 3,   // Defines calculated value state when set
  MissingValue = 1 << 4,      // Defines missing value when set
  ReservedFlag = 1 << 5,      // Reserved flag
  UserDefinedFlag1 = 1 << 6,  // User defined flag 1
  UserDefinedFlag2 = 1 << 7   // User defined flag 2
 }
DataQualityFlags; // sizeof(uint8), 1-byte
```

> :information_source: These quality flags are intentionally simple to accommodate a very wide set of use cases and still provide some indication of data point value quality. More complex data qualities can exist as new data points.
