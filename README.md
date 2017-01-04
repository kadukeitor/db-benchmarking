# DB Benchmarking

## Configuration

Copy the file `<source>.json.dist` to `<source>.json` and set your params.

## How to Use

`
./cli.js <operation> <source> -w <workers> -i <iterations>
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
- `-i` iterations (optional)

### Examples

#### Insert

`
./cli.js insert mongodb -w 5
`

#### Read

`
./cli.js read mongodb -d 1000
`

#### Count

`
./cli.js count mongodb
`

#### Remove

`
./cli.js remove mongodb
`

#### Schema

`
./cli.js schema mongodb
`

#### Remove

`
./cli.js drop mongodb
