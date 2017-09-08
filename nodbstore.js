const now = () => (new Date()).getTime()

/**
 * An interface of storage that will work with the db
 */
class Storage {
  init() { }
  write() { }
  load() { }
}


/**
 * A database that work with memory but can work with other stores
 */
class NoDBStore {
  constructor() {
    this.conf = {
      lastId: 0
    }
    this.data = []
    this._data = {}
    this._stores = []
  }

  /**
   * Add a storage that he will write
   * @param NoDBStore.Storage store the storage to add
   */
  addStore(store) {
    if (store instanceof Storage) {
      store.nodb = this
      store.init()
      this._stores.push(store)
    } else {
      throw new Error('A store need to be extended by NoDBStore.Storage')
    }
  }

  /**
   * Get the database as a JS object
   * @return object export of the db
   */
  toObj() {
    return { conf: this.conf, data: this.data }
  }

  /**
   * Get the database as a json format
   * @return string JSON export of the db
   */
  toJson() {
    return JSON.stringify(this.toObj())
  }

  /**
   * Will write in all storage
   */
  write() {
    for (let i = 0; i < this._stores.length; i++) {
      this._stores[i].write()
    }
  }

  /**
   * Load the database from an Object
   * @param object db object of the export of database
   */
  loadObj(db) {
    this.conf = db.conf
    this.data = db.data
    this._update_data()
  }

  /**
   * Load the database from a JSON string
   * @param string json json of the database
   */
  loadJson(json) {
    this.loadObj(JSON.parse(json))
  }

  /**
   * Load the db from a store
   * @param NoDBStore.Storage store the store that he will load the db
   */
  loadFromStore(store) {
    store.load()
  }

  _update_data() {
    for (let i = 0; i < this.data.length; i++) {
      const d = this.data[i]
      this._data[d._id] = d
    }
  }

  /**
   * Import the database from a json file
   * @param string dbPath path to the db file
   */
  import(dbPath) {
    this.loadFile(dbPath, false)
  }

  /**
   * Export the database to a json file
   * @param string dbPath path to the db file
   */
  export(dbPath) {
    this.write(dbPath)
  }

  /**
   * Test if an entry exists with this id
   * @param {*} id id to test
   * @return boolean 
   */
  exists(id) {
    return this.get(id) !== undefined
  }

  /**
   * Get the entry by his id, !! DO NOT EDIT _ID
   * @param integer id the id of the entry that u want
   * @return {*} the entry
   */
  get(id) {
    return this._data[id]
  }

  /**
   * Get the index (this.data) of entry from his _id 
   * @param integer id _id of the entry
   * @return integer the index or -1 if not found
   */
  indexOf(id) {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i]._id === id) return i
    }
    return -1
  }

  /**
   * Create an entry if _id is undefined or update it if _id is defined and exists in the db (else throw an error)
   * @param {*} datas entry to add or update with this
   * @return {*} the entry
   */
  put(datas) {
    if (datas._id === undefined) { // insertMode
      datas._id = this.conf.lastId++
      datas._createdAt = now()
      this._data[datas._id] = datas
      this.data.push(datas)
    } else { // updateMode
      if (this.exists(datas._id) === false) {
        throw new Error('Db have no entry with id : ' + datas._id)
      }
      const edited = this.get(datas._id)
      for (const key in datas) {
        edited[key] = datas[key]
      }
      edited._updatedAt = now()
    }
    this.write()
    return this.get(datas._id)
  }

  /**
   * Overwrite an entry with the following data (an existing entry is required with _id specified) (slower than a put)
   * @param {*} data to OverWrite entry _id with this
   * @return {*} the entry
   */
  overwrite(datas) {
    if (this.exists(datas._id) === false) {
      throw new Error('Db have no entry with id : ' + datas._id)
    }
    const old = this.get(datas._id)
    datas._createdAt = old._createdAt
    datas._updatedAt = now()
    this._data[datas._id] = datas
    this.data[this.indexOf(datas._id)] = datas
    this.write()
    return datas
  }

  /**
   * Remove an entry by is id
   * @param {*} id the id of the entry to remove
   * @param {*} softDelete dont delete from db , just add _removedAt : now() (default false)
   * @return {*} the removed entry
   */
  remove(id, softDelete = false) {
    if (this.exists(id) === false) {
      throw new Error('Db have no entry with id : ' + id)
    }
    let old = this.get(id)
    if (softDelete === false) {
      delete this._data[id]
      this.data.splice(this.indexOf(id), 1)
    }
    old._removedAt = now()
    this.write()
    return old
  }

  /**
   * Find one element !! you work directly on the item, if you edit it , it will not be updated in the file
   * @param function filter(entry,index) function that return true if the entry is what you want
   * @param boolean fromEnd start from end 
   * @return {*} the entry if it finded one else null
   */
  findOne(filter = () => true, fromEnd = false) {
    if (fromEnd === false) {
      for (let i = 0; i < this.data.length; i++) {
        const entry = this.data[i]
        if (filter(entry, i) === true) return { ...entry, _index: i }
      }
    } else {
      for (let i = this.data.length - 1; i > 0; i--) {
        const entry = this.data[i]
        if (filter(entry, i) === true) return { ...entry, _index: i }
      }
    }

    return null
  }

  /**
   * Find all elements !! you work directly on the item, if you edit it , it will not be updated in the file unless you do a writeFile after
   * Can be used as a foreach
   * @param function filter(entry,index) function that return true if the entry is what you want
   * @return array entries that matched the filter
   */
  find(filter = () => true) {
    const res = []

    for (let i = 0; i < this.data.length; i++) {
      const entry = this.data[i]
      if (filter(entry, i) === true) res.push({ ...entry, _index: i })
    }

    return res
  }

  /**
   * Do something on all elements
   * @param function action(entry, index) do what you want with each entry
   */
  forEach(action = () => { }) {
    for (let i = 0; i < this.data.length; i++) {
      action(this.data[i], i)
    }
    this.write()
  }
}

NoDBStore.Storage = Storage

module.exports = NoDBStore