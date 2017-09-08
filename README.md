# NoDBStore

Simple database working on memory and can have multiple storage

it will be use for small data that need to be stored easily with a simple api

## Getting started

`npm i nodbstore`

### create the db

Only in memory

```js
const nodbstore = require('nodbstore')
// create a database (a simple table)
const db = new nodbstore()
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
// to JSON string
db.toJson()
// to JS Object !! thats not a clone !
db.toObj()

// if you want a clone :
JSON.parse(db.toJson())
```

### import

```js
// from JSON string
db.loadJson(jsonString)
// from exported db object !! it will edit directly the object
db.loadObj(exportedDbObject)

// wana work from a clone
db.loadJson(JSON.stringify(exportedDbObject))
```

### add a storage

```js
class NewStore extends nodbstore.Storage {
  write(json) {
    this.nodb // the instance of the database
    console.log(json)
    json === this.nodb.toJson() // -> true
  }
}

db.addStore(new NewStore())
```