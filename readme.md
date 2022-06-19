
# Dev Team Backup and Archive

Your development team will have the goal of archiving an existing infrastructure, both for legal and practical reasons.
Example of features to develop:

* Archive all instances of a vpc.
* Extract images for import into vm ware.
* Perform a backup rotation (beyond a certain duration, delete the backup).
* Delete a whole vpc.

## Built With

* [NodeJS](https://nodejs.org)
* [AWS NodeJS SDK](https://aws.amazon.com/fr/sdk-for-javascript)
* [Jest](https://jestjs.io)
* [VIR1-CORE](https://github.com/Thynkon/VIR1-CORE)

## Installation

### Prerequisite

* [npm 8.3.0 or later](https://www.npmjs.com/)
* [node 16.10.0 or later](https://nodejs.org/en/)


### Install VIR1_BACKUP

```bash
  git clone https://github.com/antbou/VIR1_BACKUP.git
  cd VIR1_BACKUP
  npm install
```
    
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.


## Authors

- [@antbou](https://github.com/antbou)
- [@robielcpnv](https://github.com/robielcpnv)
- [@NoahDelgado](https://github.com/NoahDelgado)
- [@HDubuis](https://github.com/HDubuis)

