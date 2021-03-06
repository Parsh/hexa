import { chain } from 'icepick'
import {
  DB_INITIALIZED,
  DB_FETCHED,
  DB_INSERTED,
  KEY_FETCHED,
  SERVICES_INITIALIZED,
} from '../actions/storage'
import { Database } from '../../common/interfaces/Interfaces'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import KeeperService from '../../bitcoin/services/KeeperService'
import { COMPLETED_WALLET_SETUP } from '../actions/setupAndAuth'

const initialState: {
  databaseInitialized: Boolean;
  insertedIntoDB: Boolean;
  key: String;
  database: Database;
  dbFetched: Boolean;
  databaseSSS: {};
  initialServiceInstances: {
    regularAcc: RegularAccount;
    testAcc: TestAccount;
    secureAcc: SecureAccount;
    s3Service: S3Service;
    trustedContacts: TrustedContactsService;
    keepersInfo: KeeperService;
  };
} = {
  databaseInitialized: false,
  insertedIntoDB: false,
  key: '',
  database: {
    WALLET_SETUP: null, DECENTRALIZED_BACKUP: null
  },
  dbFetched: false,
  databaseSSS: {
  },
  initialServiceInstances: null
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case DB_INITIALIZED:
        return chain( state )
          .setIn( [ 'databaseInitialized' ], action.payload.initialized )
          .value()


      case DB_FETCHED:
        return chain( state ).setIn( [ 'database' ], action.payload.database )
          .setIn( [ 'insertedIntoDB' ], true )
          .setIn( [ 'dbFetched' ], true ).value()

      case DB_INSERTED:
        return chain( state ).setIn( [ 'database' ], {
          ...state.database,
          ...action.payload.updatedEntity,
        } ).setIn( [ 'insertedIntoDB' ], true ).value()


      case SERVICES_INITIALIZED:
        return chain( state )
          .setIn( [ 'initialServiceInstances' ],  action.payload.services )
          .value()

      case COMPLETED_WALLET_SETUP:
        return chain( state )
          .setIn( [ 'initialServiceInstances' ],  null )
          .value()

      case KEY_FETCHED:
        return chain( state ).setIn( [ 'key' ], action.payload.key ).value()

  }
  return state
}
