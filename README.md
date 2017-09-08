# nodbsync
Simple database working on memory or/and file system
actually it work syncroneously

it will be use for small data that need to be stored and exported/imported easily with a simple api

## Getting started

`npm i nodbsync`

### create the db
Only in memory
```js
const nodbsync = require('nodbsync')

// create a database (a simple table)
const db = new nodbsync()
```

with a db file
```js
const db = new nodbsync('path/to/db/file.ext')
// file is a json btw
```

### insert an element
```js
// O(1)
const entry = db.put({some:'data',and:['more','if','you','want']})
```

### edit an element 
```js
// O(1)
const editedEntry = db.put({ _id: entry._id, add:'a field', some:undefined })
```

### remove an element
```js
// O(1)
const deletedEntry = db.remove(entry._id)
```

### get an entry
```js
// O(1)
const gettedEntry = db.get(entry._id)
```

### find an element
```js
// O(n)
// stop when it finded one
const entry = db.findOne( entry => entry.some === 'data' )

// start from the end
const entry = db.findOne( entry => entry.some === 'data', true )

// return null if it doesnt find something
```

### find all entries
```js
// O(n)
// always return an array
const entries = db.find( entry => entry.some === 'data' )
```

### export 
```js
// to file
db.export('path/to/export/file')
// to JSON string
db.toJson()
// to JS Object !! thats not a clone !
db.toObj()

// if you want a clone : 
JSON.parse(db.toJson())
```

### import 
```js
// from file
db.import('path/to/import/file')
// from JSON string
db.loadJson(jsonString)
// from exported db object !! it will edit directly the object
db.loadObj(exportedDbObject)

// wana work from a clone
db.loadJson(JSON.stringify(exportedDbObject))
```

