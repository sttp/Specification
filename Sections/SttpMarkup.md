## Sttp Markup

Markup languages provide a significant level of flexibility and simplicity but at the expense of size and speed. Sttp wants to take advantage of this flexibility without the expense size and speed. In addition the most popular markup languages are string based, so data types are not stored natively which increases the complexity of defining a proper parsing means to encode/decode these with all appropriate string escape sequences. 

Rather than reuse an existing markup language, it was easier to describe a binary structure that transfers values in raw format but is formatted similar to a markup language. This has become Sttp Markup.

### Comparison

As an illustration, the XML command below has been written as SttpMarkup, XML, JSON, and YAML. It was also passed through a DEFLATE algorithm. The sizes in bytes of each result is shown in the table below.

``` XML
<?xml version="1.0" encoding="utf-8"?>
<Historical>
  <Start ValueType="SttpTime">12/1/2017 1:00:00 AM</Start>
  <Stop ValueType="SttpTime">12/1/2017 2:00:00 AM</Stop>
  <PointList>
    <ID ValueType="Int64">1</ID>
    <ID ValueType="Int64">2</ID>
    <ID ValueType="Int64">3</ID>
    <ID ValueType="Int64">4</ID>
  </PointList>
</Historical>
```

| Language    | Raw Size | Deflate Size|
|------------:|:--------:|:-----------:|
| Sttp Markup | 69       | 67          |
| XML         | 353      | 167         |
| JSON        | 223      | 110         |
| YAML        | 167      | 95          |

Due to Sttp Markup's superior size and speed, all commands (except ones for streaming data points) will be expressed using the Sttp Markup Language.

### Design Overview

Sttp Markup is encoded using a Bit-Byte-Block. This allows for representing the element overhead in a few bits are necessary.

Only the following 3 items can be written:
* Start Element - This creates an opening element so nested elements can exist. This item will only accept a single ASCII string name that must not exceed 255 characters in length. 
* End Element - Accepts no parameters, but ends the previously started element. 
* Write Value - Writes a single value, consists of a Name, a Type, and the raw data. The name must also meet the ASCII and 255 character limit. And the Type must be one of the official Sttp Value Type Codes. 
* End Document - Occurs at the end of the document.

There is also a `Root Element` which most of the times will correspond as the name of the command that is being executed.

Sttp Markup follows the conventional rules of XML.

When SttpMarkup serializes a user command, it takes hints from what has already been written to reduce the size of the output. For example, If the Value "Start" of type "SttpTime" is always followed by "Stop" of type "SttpTime", this overhead can be eliminated the next time it notices this patter. In addition, once a value has used a specific "Type", the next time that this value name is encountered, the type will not need to be repeated unless it changes. This is why it's important for some commands to have separate names. For example, a metadata command calls items "Field1" "Field2" "Field3." And null columns are included rather than excluded. Excluding a null column will interrupt the sequence causing more encoding overhead. 

### Details

In order to encode/decode SttpMarkup state data must be generated and maintained during the encoding/decoding process. This state information is associated with the "Name" of Element and Value. Rather than keeping two different state tables (one for Element, another one for Value), both of them will be combined. The state information maintained per "Name" is as follows:

``` C
struct {
  int ID;                         // An identity field starting with 0.
  string Name;                    // The name tied to this state infomation.
  int NextNameID;                 // The ID of the next expected name to encouter in the sequence.
  SttpValueTypeCode PreviousType; // The type code that was specified last time this value was used.
} NameBasedStateInformation;
```
* ID - The ID that has been assigned to this "Name." This value starts at 0, and increases every time a distinct Name has been supplied to the encoding algorithm. 
* Name - The name of the Element/Value. Name matches are case sensitive.
* NextNameID - The index of the NameID that should be occurring next in the sequence based on the NameID that existed last time. If there was no last time (In other works, this is the first time that Name has occurred) it defaults to ID + 1.
* PreviousType - The value type code that was used the last time a value was saved. This field is only changed if AddValue was called to specify a value. If Start Element, this record keeps its last value. This field defaults to SttpValueTypeCode.Null the first time a value is added.

The wire level encoding will be processed as the data is being written. This is a single pass encoding method. 

All data will be written to the BitByteBlock. Therefore see this section for more details on how data is written.

Data is written using the following sequence:

1. (ASCII) Root Element. (Note: ASCII is encoded differently than String).
2. If (Start Element)
   1. (uint2) 0
   2. If (Name has not occurred before)
      1. (uint1) 1
      2. (uint1) 1 (Since decoding reads 1 bit at a time, writing 1 bit at a time is desired)
      3. (ASCII) Name
   3. If (Name is the next expected name based on the previous element)
      1. (uint1) 0
   4. Otherwise
      1. (uint1) 1
      2. (uint1) 0
      3. (8BitSegment) The ID associated with the Element Name.
3. If (End Element)
   1. (uint2) 2
4. If (Write Value)
   1. (uint2) 1
   2. If (Name has not occurred before)
      1. (uint1) 1
      2. (uint1) 1 (Since decoding reads 1 bit at a time, writing 1 bit at a time is desired)
      3. (ASCII) Name
   3. If (Name is the next expected name based on the previous element)
      1. (uint1) 0
   4. Otherwise
      1. (uint1) 1
      2. (uint1) 0
      3. (8BitSegment) The ID associated with the Element Name.
   5. THEN if PreviousType equals the CurrentTypeCode
      1. (uint1) 0
      2. Save the value without the value type code. See STTPValue Encoding.
   6. ELSE 
      1. (uint1) 1
      2. Save the value with the value type code. See STTPValue Encoding.
5. If (End Of Document)
   1. (uint2) 3

Please review the code sample below for questions:

Encoding Sample:

``` C
using System;
using System.Collections.Generic;

namespace Sttp
{
    public class SttpMarkupWriter
    {
        /// <summary>
        /// Helper class that contains the state data to assist in compressing the data.
        /// </summary>
        private class NameLookupCache
        {
            /// <summary>
            /// The name of the element/value. Must be less than 256 characters and 7-bit ASCII.
            /// </summary>
            public string Name;
            /// <summary>
            /// The index position of the next NameID. This defaults to the current index + 1, 
            /// and always matches the most recent name ID last time this name traversed to a new ID. (Can be the same)
            /// </summary>
            public int NextNameID;
            /// <summary>
            /// The value type code used to encode this value. Defaults to null, and is assigned every time a value is
            /// saved using this name. If elements are saved, the value is unchanged.
            /// </summary>
            public SttpValueTypeCode PrevValueTypeCode;

            public NameLookupCache(string name, int nextNameID)
            {
                Name = name;
                NextNameID = nextNameID;
                PrevValueTypeCode = SttpValueTypeCode.Null;
            }
        }

        /// <summary>
        /// A helper class so calls to <see cref="SttpMarkupWriter.EndElement"/> can be wrapped in a using clause.
        /// Note: this class is a single instance class and does not protect against multiple calls to Dispose. Therefore,
        /// it's not intended to be used outside of making it easier to section out code.
        /// </summary>
        public class ElementEndElementHelper : IDisposable
        {
            private SttpMarkupWriter m_parent;
            public ElementEndElementHelper(SttpMarkupWriter parent)
            {
                m_parent = parent;
            }
            public void Dispose()
            {
                m_parent.EndElement();
            }
        }

        /// <summary>
        /// A lookup of all names that have been registered.
        /// </summary>
        private Dictionary<string, int> m_nameCache = new Dictionary<string, int>();
        /// <summary>
        /// A list of all names and the state data associated with these names.
        /// </summary>
        private List<NameLookupCache> m_namesList = new List<NameLookupCache>();
        /// <summary>
        /// The list of elements so an error can occur when the element tree is invalid..
        /// </summary>
        private Stack<string> m_elementStack = new Stack<string>();
        /// <summary>
        /// Where to write the data.
        /// </summary>
        private ByteWriter m_stream = new ByteWriter();
        /// <summary>
        /// A reusable class to ease in calling the <see cref="EndElement"/> method.
        /// </summary>
        private ElementEndElementHelper m_endElementHelper;
        /// <summary>
        /// A temporary value so this class can support setting from an object type.
        /// </summary>
        private SttpValueMutable m_tmpValue = new SttpValueMutable();
        /// <summary>
        /// The most recent name that was encountered
        /// </summary>
        private NameLookupCache m_prevName;
        /// <summary>
        /// Gets if ToSttpMarkup has been called. 
        /// </summary>
        private bool m_disposed;

        /// <summary>
        /// The root element
        /// </summary>
        private string m_rootElement;

        /// <summary>
        /// Create a new writer with the provided root element.
        /// </summary>
        /// <param name="rootElement"></param>
        public SttpMarkupWriter(string rootElement)
        {
            m_rootElement = rootElement;
            m_endElementHelper = new ElementEndElementHelper(this);
            m_prevName = new NameLookupCache(string.Empty, 0);
            m_stream.WriteAsciiShort(m_rootElement);
        }

        /// <summary>
        /// The root element of this writer.
        /// </summary>
        public string RootElement => m_rootElement;

        /// <summary>
        /// The current element, can be the root element.
        /// </summary>
        public string CurrentElement
        {
            get
            {
                if (m_elementStack.Count == 0)
                    return m_rootElement;
                return m_elementStack.Peek();
            }
        }

        /// <summary>
        /// The approximate current size of the writer. It's not exact until <see cref="ToSttpMarkup"/> has been called.
        /// </summary>
        public int CurrentSize => m_stream.Length;

        //Encoding Scheme: 
        //
        // First, determine the Node Type.
        // 2 bits, SttpMarkupType
        // If EndElement, then exit.
        //
        // Second, Determine the next NameIndex
        // 0: Next NameIndex is same as the last time it was encountered.
        // 1: It's not, Next index is 8 bit encoded number.
        // Third, If NodeType:Value, write the value.

        /// <summary>
        /// Starts a new element with the specified name. 
        /// </summary>
        /// <param name="name">The name of the element. This name must conform to 7-bit ascii and may not exceed 255 characters in length.</param>
        /// <returns>an object that can be used in a using block to make the code cleaner.</returns>
        public ElementEndElementHelper StartElement(string name)
        {
            if (m_disposed)
                throw new ObjectDisposedException("Once ToSttpMarkup has been called, no more data can be written to this object.");

            if (name == null || name.Length == 0)
                throw new ArgumentNullException(nameof(name));

            m_elementStack.Push(name);
            m_stream.WriteBits2((uint)SttpMarkupNodeType.Element);
            WriteName(name);

            return m_endElementHelper;
        }

        /// <summary>
        /// Ends the current element. This should not be called if <see cref="StartElement"/> is inside a using block, since 
        /// this will automatically be called when exiting the using block.
        /// </summary>
        public void EndElement()
        {
            if (m_disposed)
                throw new ObjectDisposedException("Once ToSttpMarkup has been called, no more data can be written to this object.");

            m_elementStack.Pop();
            m_stream.WriteBits2((uint)SttpMarkupNodeType.EndElement);
        }
        
        /// <summary>
        /// Writes the provided value.
        /// </summary>
        /// <param name="name">the name of the value. This name must conform to 7-bit ascii and may not exceed 255 characters in length.</param>
        /// <param name="value">the value itself.</param>
        public void WriteValue(string name, SttpValue value)
        {
            if (m_disposed)
                throw new ObjectDisposedException("Once ToSttpMarkup has been called, no more data can be written to this object.");

            if (name == null || name.Length == 0)
                throw new ArgumentNullException(nameof(name));
            if ((object)value == null)
                throw new ArgumentNullException(nameof(value));

            m_stream.WriteBits2((uint)SttpMarkupNodeType.Value);
            WriteName(name);
            if (value.ValueTypeCode == m_prevName.PrevValueTypeCode)
            {
                m_stream.WriteBits1(0);
                SttpValueEncodingWithoutType.Save(m_stream, value);
            }
            else
            {
                m_stream.WriteBits1(1);
                SttpValueEncodingNative.Save(m_stream, value);
                m_prevName.PrevValueTypeCode = value.ValueTypeCode;
            }
        }

        private void WriteName(string name)
        {
            if (!m_nameCache.TryGetValue(name, out int index))
            {
                m_nameCache[name] = m_nameCache.Count;
                m_namesList.Add(new NameLookupCache(name, m_nameCache.Count));
                index = m_nameCache.Count - 1;
                m_stream.WriteBits1(1);
                m_stream.WriteBits1(1);
                m_stream.WriteAsciiShort(name);
            }
            else if (m_prevName.NextNameID == index)
            {
                m_stream.WriteBits1(0);
            }
            else
            {
                m_stream.WriteBits1(1);
                m_stream.WriteBits1(0);
                m_stream.Write8BitSegments((uint)index);
            }
            m_prevName.NextNameID = index;
            m_prevName = m_namesList[index];
        }

        /// <summary>
        /// Writes the provided value.
        /// </summary>
        /// <param name="name">the name of the value. This name must conform to 7-bit ascii and may not exceed 255 characters in length.</param>
        /// <param name="value">the value itself.</param>
        public void WriteValue(string name, object value)
        {
            if (m_disposed)
                throw new ObjectDisposedException("Once ToSttpMarkup has been called, no more data can be written to this object.");

            m_tmpValue.SetValue(value);
            WriteValue(name, m_tmpValue);
        }

        /// <summary>
        /// Writes the provided value.
        /// </summary>
        /// <param name="name">the name of the value. This name must conform to 7-bit ascii and may not exceed 255 characters in length.</param>
        /// <param name="value">the value itself as a byte buffer.</param>
        public void WriteValue(string name, byte[] value, int offset, int length)
        {
            value.ValidateParameters(offset, length);
            byte[] data2 = new byte[length];
            Array.Copy(value, offset, data2, 0, length);
            WriteValue(name, data2);
        }

        /// <summary>
        /// Completes the writing to an <see cref="SttpMarkup"/> and returns the completed buffer. This may be called multiple times.
        /// </summary>
        /// <returns></returns>
        public SttpMarkup ToSttpMarkup()
        {
            if (!m_disposed)
            {
                m_stream.WriteBits2((byte)SttpMarkupNodeType.EndOfDocument);
                m_disposed = true;
            }
            return new SttpMarkup(m_stream.ToArray());
        }
    }
}
```

Decoding Sample: 

``` C

using System;
using System.Collections.Generic;
using System.IO;

namespace Sttp
{
    /// <summary>
    /// A class for reading SttpMarkup documents.
    /// </summary>
    public class SttpMarkupReader
    {
        /// <summary>
        /// Helper class that contains the state data to assist in decompressing the data.
        /// </summary>
        private class NameLookupCache
        {
            /// <summary>
            /// The name of the element/value. Must be less than 256 characters and 7-bit ASCII.
            /// </summary>
            public string Name;
            /// <summary>
            /// The index position of the next NameID. This defaults to the current index + 1, 
            /// and always matches the most recent name ID last time this name traversed to a new ID. (Can be the same)
            /// </summary>
            public int NextNameID;
            /// <summary>
            /// The value type code used to encode this value. Defaults to null, and is assigned every time a value is
            /// saved using this name. If elements are saved, the value is unchanged.
            /// </summary>
            public SttpValueTypeCode PrevValueTypeCode;

            public NameLookupCache(string name, int nextNameID)
            {
                Name = name;
                NextNameID = nextNameID;
                PrevValueTypeCode = SttpValueTypeCode.Null;
            }
        }

        /// <summary>
        /// The stream for reading the byte array.
        /// </summary>
        private ByteReader m_stream;
        /// <summary>
        /// A list of all names and the state data associated with these names.
        /// </summary>
        private List<NameLookupCache> m_namesList = new List<NameLookupCache>();
        /// <summary>
        /// The list of elements so the <see cref="ElementName"/> can be retrieved.
        /// </summary>
        private Stack<NameLookupCache> m_elementStack = new Stack<NameLookupCache>();
        /// <summary>
        /// The most recent name that was encountered
        /// </summary>
        private NameLookupCache m_prevName;
        /// <summary>
        /// The root element.
        /// </summary>
        private string m_rootElement;

        /// <summary>
        /// Creates a markup reader from the specified byte array.
        /// </summary>
        /// <param name="data"></param>
        internal SttpMarkupReader(byte[] data)
        {
            m_stream = new ByteReader(data, 0, data.Length);
            Value = new SttpValueMutable();
            m_prevName = new NameLookupCache(string.Empty, 0);
            NodeType = SttpMarkupNodeType.StartOfDocument;
            m_rootElement = m_stream.ReadAsciiShort();
            ElementName = GetCurrentElement();
        }

        /// <summary>
        /// The name of the root element.
        /// </summary>
        public string RootElement => m_rootElement;
        /// <summary>
        /// The depth of the element stack. 0 means the depth is at the root element.
        /// </summary>
        public int ElementDepth => m_elementStack.Count;
        /// <summary>
        /// The current name of the current element. Can be the RootElement if ElementDepth is 0 and <see cref="NodeType"/> is not <see cref="SttpMarkupNodeType.EndElement"/>.
        /// In this event, the ElementName does not change and refers to the element that has just ended.
        /// </summary>
        public string ElementName { get; private set; }
        /// <summary>
        /// If <see cref="NodeType"/> is <see cref="SttpMarkupNodeType.Value"/>, the name of the value. Otherwise, null.
        /// </summary>
        public string ValueName { get; private set; }
        /// <summary>
        /// If <see cref="NodeType"/> is <see cref="SttpMarkupNodeType.Value"/>, the value. Otherwise, SttpValue.Null.
        /// Note, this is a mutable value and it's contents will change with each iteration. To keep a copy of the 
        /// contents, be sure to call <see cref="SttpValue.Clone"/>
        /// </summary>
        public SttpValueMutable Value { get; private set; }

        /// <summary>
        /// The type of the current node. To Advance the nodes calll <see cref="Read"/>
        /// </summary>
        public SttpMarkupNodeType NodeType { get; private set; }

        /// <summary>
        /// Reads to the next node. If the next node is the end of the document. False is returned. Otherwise true.
        /// </summary>
        /// <returns></returns>
        public bool Read()
        {
            if (NodeType == SttpMarkupNodeType.EndOfDocument)
                return false;

            if (NodeType == SttpMarkupNodeType.EndElement)
            {
                ElementName = GetCurrentElement();
            }

            NodeType = (SttpMarkupNodeType)m_stream.ReadBits2();
            switch (NodeType)
            {
                case SttpMarkupNodeType.Element:
                    Value.SetNull();
                    ReadName();
                    m_elementStack.Push(m_prevName);
                    ElementName = m_prevName.Name;
                    ValueName = null;
                    break;
                case SttpMarkupNodeType.Value:
                    ReadName();
                    if (m_stream.ReadBits1() == 0)
                    {
                        //Same type code;
                        SttpValueEncodingWithoutType.Load(m_stream, m_prevName.PrevValueTypeCode, Value);
                    }
                    else
                    {
                        SttpValueEncodingNative.Load(m_stream, Value);
                        m_prevName.PrevValueTypeCode = Value.ValueTypeCode;
                    }
                    ValueName = m_prevName.Name;
                    break;
                case SttpMarkupNodeType.EndElement:
                    ElementName = GetCurrentElement();
                    m_elementStack.Pop();
                    break;
                case SttpMarkupNodeType.EndOfDocument:
                    return false;
                default:
                    throw new ArgumentOutOfRangeException();
            }
            return true;
        }

        private void ReadName()
        {
            if (m_stream.ReadBits1() == 1)
            {
                if (m_stream.ReadBits1() == 1)
                {
                    m_namesList.Add(new NameLookupCache(m_stream.ReadAsciiShort(), m_namesList.Count));
                    m_prevName.NextNameID = m_namesList.Count - 1;
                }
                else
                {
                    int index = (int)m_stream.Read8BitSegments();
                    m_prevName.NextNameID = index;
                }
            }
            m_prevName = m_namesList[m_prevName.NextNameID];
        }

        /// <summary>
        /// Reads the entire element into an in-memory object, advancing to the end of this element. This is the most convenient method of reading
        /// but is impractical for large elements. The intended mode of operation is to interweave calls to <see cref="Read"/> with <see cref="ReadEntireElement"/> to assist in parsing.
        /// </summary>
        /// <returns></returns>
        public SttpMarkupElement ReadEntireElement()
        {
            return new SttpMarkupElement(this);
        }

        private string GetCurrentElement()
        {
            if (m_elementStack.Count == 0)
                return m_rootElement;
            return m_elementStack.Peek().Name;
        }

    }
}



```