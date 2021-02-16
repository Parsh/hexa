import { DONATION_ACCOUNT, REGULAR_ACCOUNT, SECURE_ACCOUNT, TEST_ACCOUNT, WYRE, RAMP } from '../../../common/constants/wallet-service-types'

export const getAccountIcon = ( accountKind, derivativeAccountDetails? ) => {
  // determines account icon
  let accountImageSource
  if( derivativeAccountDetails ){
    switch( derivativeAccountDetails.type ){
        case DONATION_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_donation_hexa.png' )
          break
        case RAMP:
          accountImageSource = require( '../../../assets/images/icons/ramp_logo_notext.png' )
          break
        case WYRE:
          accountImageSource = require( '../../../assets/images/icons/wyre_notext_small.png' )
          break
    }
  }
  if( !accountImageSource ){
    switch( accountKind ){
        case TEST_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_test.png' )
          break

        case REGULAR_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_regular.png' )
          break

        case SECURE_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_secureaccount.png' )
          break
    }
  }

  return accountImageSource
}


export const getAccountTitle = ( accountKind, derivativeAccountDetails ) => {
// determines account title
  let accountTitle
  if( derivativeAccountDetails ){
    switch( derivativeAccountDetails.type ){
        case DONATION_ACCOUNT:
          accountTitle = 'Donation Account'
          break
        case RAMP:
          accountTitle = 'Ramp'
        case WYRE:
          accountTitle = 'Wyre'
          break
    }
  }

  if( !accountTitle ){
    switch( accountKind ){
        case TEST_ACCOUNT:
          accountTitle = 'Test Account'
          break

        case REGULAR_ACCOUNT:
          accountTitle = 'Checking Account'
          break

        case SECURE_ACCOUNT:
          accountTitle = 'Savings Account'
          break
    }
  }

  return accountTitle
}
