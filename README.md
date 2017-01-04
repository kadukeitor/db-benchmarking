# DB Benchmarking

## Install

- `git clone https://github.com/kadukeitor/db-benchmarking.git`
- `cd db-benchmarking`
- `npm install`

## Configuration

Copy the file `<source>.json.dist` to `<source>.json` and set your params.

## How to Use

`
./cli.js <operation> <source> -w <workers> -d <documents>
`

### Operations

- schema
- insert
- read
- count
- remove
- drop

### Sources

- mongodb
- cassandra

### Options

- `-w` workers (optional)
- `-d` documents (optional)

### Examples

#### Insert

Insert -d documents by each -w worker on the table/collection

`
./cli.js insert mongodb -w 5 -d 1000
`

#### Read

Read -d documents by each -w worker on the table/collection

`
./cli.js read mongodb -d 1000
`

#### Count

Count the number of documents/rows on the table/collection

`
./cli.js count mongodb
`

#### Remove

Remove all documents/rows on the table/collection

`
./cli.js remove mongodb
`

#### Schema

Create the table/collection schema

`
./cli.js schema mongodb
`

#### Remove

Drop the table/collection

`
./cli.js drop mongodb
`