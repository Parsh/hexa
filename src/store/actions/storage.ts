import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import KeeperService from '../../bitcoin/services/KeeperService'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import dataManager from '../../storage/database-manager'

// types and action creators: dispatched by components and sagas
export const INIT_DB = 'INIT_DB'
export const FETCH_FROM_DB = 'FETCH_FROM_DB'
export const INSERT_INTO_DB = 'INSERT_INTO_DB'
export const KEY_FETCHED = 'KEY_FETCHED'
export const INITIALIZE_SERVICES = 'INITIALIZE_SERVICES'
export const ENRICH_SERVICES = 'ENRICH_SERVICES'


export const initializeDB = () => {
  return {
    type: INIT_DB
  }
}

export const initializeServices= ( ) => {
  return {
    type: INITIALIZE_SERVICES
  }
}

export const fetchFromDB = () => {
  return {
    type: FETCH_FROM_DB
  }
}

// export const insertIntoDB = (data) => {
//   return { type: INSERT_INTO_DB, payload: { ...data } };
// }; // disabled

export const keyFetched = ( key ) => {
  return {
    type: KEY_FETCHED, payload: {
      key
    }
  }
}

export const enrichServices = ( database ) => {
  return {
    type: ENRICH_SERVICES, payload: {
      database
    }
  }
}

// types and action creators (saga): dispatched by saga workers
export const DB_INITIALIZED = 'DB_INITIALIZED'
export const SERVICES_INITIALIZED = 'SERVICES_INITIALIZED'
export const DB_FETCHED = 'DB_FETCHED'
export const DB_INSERTED = 'DB_INSERTED'
export const SERVICES_ENRICHED = 'SERVICES_ENRICHED'

export const dbInitialized = ( initialized ) => {
  return {
    type: DB_INITIALIZED, payload: {
      initialized
    }
  }
}

export const servicesInitialized = ( services: {
  regularAcc: RegularAccount;
  testAcc: TestAccount;
  secureAcc: SecureAccount;
  s3Service: S3Service;
  trustedContacts: TrustedContactsService;
  keepersInfo: KeeperService;
} ) => {
  return {
    type: SERVICES_INITIALIZED,
    payload:{
      services
    }
  }
}

export const dbFetched = ( database ) => {
  return {
    type: DB_FETCHED, payload: {
      database
    }
  }
}

export const dbInserted = ( updatedEntity ) => {
  return {
    type: DB_INSERTED, payload: {
      updatedEntity
    }
  }
}

export const servicesEnriched = ( services ) => {
  return {
    type: SERVICES_ENRICHED, payload: {
      services
    }
  }
}


// handle thunk way
export const fetchDatabase = ( key ) => {
  return async ( dispatch ) => {
    let database
    let error
    try {
      const response = await dataManager.fetch( key )
      if ( key && response ) {
        dispatch( dbFetched( response ) )
        database = response
        // triggering servicesEnricherWorker from here
        dispatch( enrichServices( database ) )
      }
    } catch ( ex ) {
      console.log( error )
      error = ex
    }
    return {
      database, error
    }
  }
}


// handle thunk way

