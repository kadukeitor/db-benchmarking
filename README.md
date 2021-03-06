# DB Benchmarking

Simple database benchmarking tool.

![Write](./.github/write.gif?raw=true "Write")

## Install

- `git clone https://github.com/kadukeitor/db-benchmarking.git`
- `cd db-benchmarking`
- `npm install`s

## Configuration

Copy the file `config/<source>.json.dist` to `config/<source>.json` and set your params.

## How to Use

`
./cli.js <operation> <source> -w <workers> -d <documents>
`

### Operations

- schema
- write
- read
- count
- remove
- drop

### Sources

- mongodb
- cassandra
- sqlite
- mysql
- redis

### Options

- `-w` workers (optional)
- `-d` documents (optional)

### Examples

We use the source mongodb as example in all the operations

#### Write

Write -d documents by each -w worker on the table/collection

`
./cli.js write mongodb -w 5 -d 1000
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