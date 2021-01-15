import React, { createRef, PureComponent } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
  AsyncStorage,
  Linking,
  Alert,
  Image,
  AppState,
} from "react-native";
import { Easing } from "react-native-reanimated";
import { heightPercentageToDP } from "react-native-responsive-screen";
import DeviceInfo from "react-native-device-info";
import CustodianRequestRejectedModalContents from "../../components/CustodianRequestRejectedModalContents";
import AddModalContents from "../../components/AddModalContents";
import * as RNLocalize from "react-native-localize";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import Colors from "../../common/Colors";
import { updateLastSeen } from "../../store/actions/preferences";

import ButtonStyles from "../../common/Styles/ButtonStyles";
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
  FAST_BITCOINS,
} from "../../common/constants/serviceTypes";
import { connect } from "react-redux";
import { downloadMShare, uploadRequestedShare, initHealthCheck } from "../../store/actions/sss";
import {
  initializeHealthSetup,
  updateMSharesHealth,
  onApprovalStatusChange,
  autoDownloadShareContact,
} from "../../store/actions/health";
import { createRandomString } from "../../common/CommonFunctions/timeFormatter";
import {
  approveTrustedContact,
  fetchEphemeralChannel,
  fetchTrustedChannel,
  clearPaymentDetails,
  postRecoveryChannelSync,
} from "../../store/actions/trustedContacts";
import {
  updateFCMTokens,
  fetchNotifications,
  notificationsUpdated,
} from "../../store/actions/notifications";
import {
  setCurrencyCode,
  setCloudBackupStatus,
  setCardData,
} from "../../store/actions/preferences";
import {
  getCurrencyImageByRegion,
  CloudData,
  getKeeperInfoFromShareId,
} from "../../common/CommonFunctions/index";
import ErrorModalContents from "../../components/ErrorModalContents";
import Toast from "../../components/Toast";
import firebase from "react-native-firebase";
import NotificationListContent from "../../components/NotificationListContent";
import { timeFormatter } from "../../common/CommonFunctions/timeFormatter";
import Config from "react-native-config";
import RelayServices from "../../bitcoin/services/RelayService";
import AddContactAddressBook from "../Contacts/AddContactAddressBook";
import config from "../../bitcoin/HexaConfig";
import TrustedContactsService from "../../bitcoin/services/TrustedContactsService";
import HomeHeader from "../../components/home/home-header_update";
import idx from "idx";
import CustomBottomTabs, {
  BottomTab,
  TAB_BAR_HEIGHT,
} from "../../components/home/custom-bottom-tabs";
import {
  addTransferDetails,
  fetchDerivativeAccBalTx,
} from "../../store/actions/accounts";
import {
  trustedChannelActions,
  LevelHealthInterface,
  MetaShare,
} from "../../bitcoin/utilities/Interface";
import moment from "moment";
import { withNavigationFocus } from "react-navigation";
import CustodianRequestModalContents from "../../components/CustodianRequestModalContents";
import semver from "semver";
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
} from "../../store/actions/preferences";
import Bitcoin from "../../bitcoin/utilities/accounts/Bitcoin";
import CloudBackup from "../../common/CommonFunctions/CloudBackup";
import TrustedContactRequestContent from "./TrustedContactRequestContent";
import BottomSheetBackground from "../../components/bottom-sheets/BottomSheetBackground";
import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import BottomSheetHeader from "../Accounts/BottomSheetHeader";
import { Button } from "react-native-elements";
import checkAppVersionCompatibility from "../../utils/CheckAppVersionCompatibility";
import defaultBottomSheetConfigs from "../../common/configs/BottomSheetConfigs";
import BottomSheet from "@gorhom/bottom-sheet";
import { resetToHomeAction } from "../../navigation/actions/NavigationActions";
import { fetchKeeperTrustedChannel } from "../../store/actions/keeper";
import { Milliseconds } from "../../common/data/typealiases/UnitAliases";
import { SATOSHIS_IN_BTC } from "../../common/constants/Bitcoin";
import { getReleaseTopic } from "../../utils/notifications/getReleaseTopic";
const releaseNotificationTopic = getReleaseTopic();
import { AccountsState } from "../../store/reducers/accounts";
import HomeAccountCardsList from "./HomeAccountCardsList";
import AccountShell from "../../common/data/models/AccountShell";
import S3Service from '../../bitcoin/services/sss/S3Service';

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800;

export enum BottomSheetState {
  Closed,
  Open,
}

export enum BottomSheetKind {
  TAB_BAR_ADD_MENU,
  CUSTODIAN_REQUEST,
  CUSTODIAN_REQUEST_REJECTED,
  TRUSTED_CONTACT_REQUEST,
  ADD_CONTACT_FROM_ADDRESS_BOOK,
  NOTIFICATIONS_LIST,
  ERROR,
}

interface HomeStateTypes {
  notificationLoading: boolean;
  notificationData?: any[];
  CurrencyCode: string;
  balances: any;
  selectedBottomTab: BottomTab | null;

  bottomSheetState: BottomSheetState;
  currentBottomSheetKind: BottomSheetKind | null;

  secondaryDeviceOtp: any;
  currencyCode: string;
  errorMessageHeader: string;
  errorMessage: string;
  selectedContact: any[];
  notificationDataChange: boolean;
  appState: string;
  trustedContactRequest: any;
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  lastActiveTime: string;
  isBalanceLoading: boolean;
  addContactModalOpened: boolean;
  encryptedCloudDataJson: any;
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any[];
  exchangeRates?: any[];
  accountsState: AccountsState;
  walletName: string;
  UNDER_CUSTODY: any;
  fetchNotifications: any;
  updateFCMTokens: any;
  postRecoveryChannelSync: any;
  downloadMShare: any;
  approveTrustedContact: any;
  fetchTrustedChannel: any;
  fetchEphemeralChannel: any;
  uploadRequestedShare: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  initHealthCheck: any;
  overallHealth: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  fetchDerivativeAccBalTx: any;
  addTransferDetails: any;
  paymentDetails: any;
  clearPaymentDetails: any;
  trustedContacts: TrustedContactsService;
  isFocused: boolean;
  notificationListNew: any;
  notificationsUpdated: any;
  setCurrencyCode: any;
  currencyCode: any;
  updatePreference: any;
  fcmTokenValue: any;
  setFCMToken: any;
  setSecondaryDeviceAddress: any;
  secondaryDeviceAddressValue: any;
  releaseCasesValue: any;
  updateLastSeen: any;
  setCloudBackupStatus: any;
  cloudBackupStatus: any;
  regularAccount: RegularAccount;
  database: any;
  updateMSharesHealth: any;
  setCardData: any;
  cardDataProps: any;
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  fetchKeeperTrustedChannel: any;
  keeperApproveStatus: any;
  onApprovalStatusChange: any;
  secureAccount: any;
  autoDownloadShareContact: any;
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;

  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;

  static whyDidYouRender = true;

  constructor(props) {
    super(props);

    this.focusListener = null;
    this.appStateListener = null;
    this.openBottomSheetOnLaunchTimeout = null;

    this.state = {
      notificationData: [],
      CurrencyCode: "USD",
      balances: {},
      selectedBottomTab: null,
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
      secondaryDeviceOtp: {},
      currencyCode: "USD",
      errorMessageHeader: "",
      errorMessage: "",
      selectedContact: [],
      notificationDataChange: false,
      appState: "",
      trustedContactRequest: null,
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      lastActiveTime: moment().toISOString(),
      notificationLoading: true,
      isBalanceLoading: true,
      addContactModalOpened: false,
      encryptedCloudDataJson: [],
    };
  }

  navigateToAddNewAccountScreen = () => {
    this.props.navigation.navigate("AddNewAccount");
  };

  onPressNotifications = async () => {
    const notificationList = JSON.parse(
      await AsyncStorage.getItem("notificationList")
    );
    const tmpList = [];
    if (notificationList) {
      for (let i = 0; i < notificationList.length; i++) {
        const element = notificationList[i];
        const obj = {
          ...element,
          read: element.isMandatory ? false : true,
        };
        tmpList.push(obj);
      }
    }
    await AsyncStorage.setItem("notificationList", JSON.stringify(tmpList));
    tmpList.sort(function (left, right) {
      return moment.utc(right.date).unix() - moment.utc(left.date).unix();
    });
    this.setState({
      notificationData: tmpList,
      notificationDataChange: !this.state.notificationDataChange,
    });
    setTimeout(() => {
      this.setState({
        notificationLoading: false,
      });
    }, 500);

    this.openBottomSheetOnLaunch(BottomSheetKind.NOTIFICATIONS_LIST);
  };

  processQRData = async (qrData) => {
    const { accountsState, addTransferDetails, navigation } = this.props;

    const network = Bitcoin.networkType(qrData);
    if (network) {
      const serviceType =
        network === "MAINNET" ? REGULAR_ACCOUNT : TEST_ACCOUNT; // default service type

      const service = accountsState[serviceType].service;
      const { type } = service.addressDiff(qrData);
      if (type) {
        let item;
        switch (type) {
          case "address":
            const recipientAddress = qrData;
            item = {
              id: recipientAddress,
            };

            addTransferDetails(serviceType, {
              selectedContact: item,
            });
            navigation.navigate("SendToContact", {
              selectedContact: item,
              serviceType,
            });
            break;

          case "paymentURI":
            let address, options, donationId;
            try {
              const res = service.decodePaymentURI(qrData);
              address = res.address;
              options = res.options;

              // checking for donationId to send note
              if (options && options.message) {
                const rawMessage = options.message;
                donationId = rawMessage.split(":").pop().trim();
              }
            } catch (err) {
              Alert.alert("Unable to decode payment URI");
              return;
            }

            item = {
              id: address,
            };

            addTransferDetails(serviceType, {
              selectedContact: item,
            });

            navigation.navigate("SendToContact", {
              selectedContact: item,
              serviceType,
              bitcoinAmount: options.amount
                ? `${Math.round(options.amount * SATOSHIS_IN_BTC)}`
                : "",
              donationId,
            });
            break;

          default:
            Toast("Invalid QR");
            break;
        }

        return;
      }
    }

    try {
      const scannedData = JSON.parse(qrData);

      if (scannedData.ver) {
        const isAppVersionCompatible = await checkAppVersionCompatibility({
          relayCheckMethod: scannedData.type,
          version: scannedData.ver,
        });

        if (!isAppVersionCompatible) {
          return;
        }
      }

      switch (scannedData.type) {
        case "trustedGuardian":
          const trustedGuardianRequest = {
            isGuardian: scannedData.isGuardian,
            approvedTC: scannedData.approvedTC,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            info: scannedData.info,
            uploadedAt: scannedData.uploadedAt,
            type: scannedData.type,
            isQR: true,
            version: scannedData.ver,
            isFromKeeper: scannedData.isFromKeeper ? scannedData.isFromKeeper : false,
          };
          this.setState(
            {
              secondaryDeviceOtp: trustedGuardianRequest,
              trustedContactRequest: trustedGuardianRequest,
              recoveryRequest: null,
              isLoadContacts: true,
            },
            () => {
              navigation.goBack();

              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              );
            }
          );

          break;

        case "secondaryDeviceGuardian":
          const secondaryDeviceGuardianRequest = {
            isGuardian: scannedData.isGuardian,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            info: scannedData.info,
            uploadedAt: scannedData.uploadedAt,
            type: scannedData.type,
            isQR: true,
            version: scannedData.ver,
          };

          this.setState(
            {
              secondaryDeviceOtp: secondaryDeviceGuardianRequest,
              trustedContactRequest: secondaryDeviceGuardianRequest,
              recoveryRequest: null,
            },
            () => {
              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              );
            }
          );

          break;

        case "trustedContactQR":
          const tcRequest = {
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            info: scannedData.info,
            type: scannedData.type,
            isQR: true,
            version: scannedData.ver,
          };

          this.setState(
            {
              secondaryDeviceOtp: tcRequest,
              trustedContactRequest: tcRequest,
              recoveryRequest: null,
            },
            () => {
              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              );
            }
          );

          break;

        case "paymentTrustedContactQR":
          const paymentTCRequest = {
            isPaymentRequest: true,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            info: scannedData.info,
            type: scannedData.type,
            isQR: true,
            version: scannedData.ver,
          };

          this.setState(
            {
              secondaryDeviceOtp: paymentTCRequest,
              trustedContactRequest: paymentTCRequest,
              recoveryRequest: null,
            },
            () => {
              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              );
            }
          );

          break;

        case "recoveryQR":
          const recoveryRequest = {
            isRecovery: true,
            requester: scannedData.requester,
            publicKey: scannedData.KEY,
            isQR: true,
          };
          this.setState(
            {
              recoveryRequest: recoveryRequest,
              trustedContactRequest: null,
            },
            () => {
              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              );
            }
          );
          break;

        case "ReverseRecoveryQR":
          Alert.alert(
            "Restoration QR Identified",
            "Restoration QR only works during restoration mode"
          );
          break;

        default:
          break;
      }
    } catch (err) {
      console.log(err);
      Toast("Invalid QR");
    }
  };

  scheduleNotification = async () => {
    const channelId = new firebase.notifications.Android.Channel(
      "Default",
      "Default",
      firebase.notifications.Android.Importance.High
    );
    firebase.notifications().android.createChannel(channelId);
    const notification = new firebase.notifications.Notification()
      .setTitle("We have not seen you in a while!")
      .setBody(
        "Opening your app regularly ensures you get all the notifications and security updates"
      )
      .setNotificationId("1")
      .setSound("default")
      .setData({
        title: "We have not seen you in a while!",
        body:
          "Opening your app regularly ensures you get all the notifications and security updates",
      })
      .android.setChannelId("reminder")
      .android.setPriority(firebase.notifications.Android.Priority.High);

    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setHours(date.getHours() + Number(Config.NOTIFICATION_HOUR));

    // console.log('DATE', date, Config.NOTIFICATION_HOUR, date.getTime());
    await firebase.notifications().scheduleNotification(notification, {
      fireDate: date.getTime(),
      //repeatInterval: 'hour',
    });

    firebase.notifications().getScheduledNotifications();
  };

  onAppStateChange = async (nextAppState) => {
    const { appState } = this.state;
    try {
      // TODO: Will this function ever be called if the state wasn't different? If not,
      // I don't think we need to be holding on to `appState` in this component's state.
      if (appState === nextAppState) return;
      this.setState(
        {
          appState: nextAppState,
        },
        async () => {
          if (nextAppState === "active") {
            this.scheduleNotification();
          }
          if (nextAppState === "inactive" || nextAppState == "background") {
            this.props.updatePreference({
              key: "hasShownNoInternetWarning",
              value: false,
            });
          }
        }
      );
    } catch (error) {}
  };

  componentDidMount = () => {
    const { navigation, s3Service, initializeHealthSetup, initHealthCheck } = this.props;
    this.closeBottomSheet();
    this.getBalances();

    this.appStateListener = AppState.addEventListener(
      "change",
      this.onAppStateChange
    );

    this.bootStrapNotifications();
    this.setUpFocusListener();
    this.getNewTransactionNotifications();

    // health check
    const { healthCheckInitialized } = s3Service.sss;
    console.log("healthCheckInitialized", healthCheckInitialized);
    if (!healthCheckInitialized) {
      initHealthCheck();
    }

    // const { healthCheckInitializedKeeper } = s3Service.levelhealth;
    // console.log("healthCheckInitializedKeeper", healthCheckInitializedKeeper);
    // if (!healthCheckInitializedKeeper) {
    //   initializeHealthSetup();
    // }

    Linking.addEventListener("url", this.handleDeepLinkEvent);
    Linking.getInitialURL().then(this.handleDeepLinking);

    // call this once deeplink is detected aswell
    this.handleDeepLinkModal();

    const unhandledDeepLinkURL = navigation.getParam("unhandledDeepLinkURL");

    if (unhandledDeepLinkURL) {
      navigation.setParams({
        unhandledDeepLinkURL: null,
      });
      this.handleDeepLinking(unhandledDeepLinkURL);
    }
  };

  cloudData = async (kpInfo?, level?, share?) => {
    const { walletName, regularAccount, s3Service } = this.props;
    let encryptedCloudDataJson;
    let shares =
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object)
        ? JSON.stringify(share)
        : "";
    encryptedCloudDataJson = await CloudData(this.props.database);
    this.setState({ encryptedCloudDataJson: encryptedCloudDataJson });
    let keeperData = [
      {
        shareId: "",
        KeeperType: "cloud",
        updated: "",
        reshareVersion: 0,
      },
    ];
    let data = {
      levelStatus: level ? level : 1,
      shares: shares,
      encryptedCloudDataJson: encryptedCloudDataJson,
      walletName: walletName,
      regularAccount: regularAccount,
      keeperData: kpInfo ? JSON.stringify(kpInfo) : JSON.stringify(keeperData),
    };
    let cloudObject = new CloudBackup({
      dataObject: data,
      callBack: this.setCloudBackupStatus,
      share,
    });
    cloudObject.CloudDataBackup(data, this.setCloudBackupStatus, share);
  };

  setCloudBackupStatus = (share?) => {
    this.props.setCloudBackupStatus({ status: true });
    if (this.props.cloudBackupStatus.status && this.props.currentLevel == 0) {
      this.updateHealthForCloud();
    } else if (
      this.props.cloudBackupStatus.status &&
      this.props.currentLevel == 1
    ) {
      this.updateHealthForCloud(share);
    }
  };

  updateCloudData = () => {
    console.log("inside updateCloudData");
    let {
      currentLevel,
      keeperInfo,
      levelHealth,
      isLevel2Initialized,
      isLevel3Initialized,
      s3Service,
    } = this.props;
    let KPInfo: any[] = [];
    let secretShare = {};
    if (levelHealth.length > 0) {
      let levelHealthVar = levelHealth[levelHealth.length - 1];
      if (levelHealthVar.levelInfo) {
        for (let i = 0; i < levelHealthVar.levelInfo.length; i++) {
          const element = levelHealthVar.levelInfo[i];
          if (
            keeperInfo.findIndex((value) => value.shareId == element.shareId) >
              -1 &&
            element.status == "accessible"
          ) {
            let kpInfoElement =
              keeperInfo[
                keeperInfo.findIndex(
                  (value) => value.shareId == element.shareId
                )
              ];
            let object = {
              type: kpInfoElement.type,
              name: kpInfoElement.name,
              shareId: kpInfoElement.shareId,
              data: kpInfoElement.data,
            };
            KPInfo.push(object);
          }
        }

        if (
          isLevel2Initialized &&
          !isLevel3Initialized &&
          levelHealthVar.levelInfo[2].status == "accessible" &&
          levelHealthVar.levelInfo[3].status == "accessible"
        ) {
          for (let i = 0; i < s3Service.levelhealth.metaSharesKeeper.length; i++) {
            const element = s3Service.levelhealth.metaSharesKeeper[i];
            if (levelHealthVar.levelInfo[0].shareId == element.shareId) {
              secretShare = element;
            }
          }
        }
      }
    }
    this.cloudData(KPInfo, currentLevel, secretShare);
    // Call icloud update Keeper INfo with KPInfo and currentLevel vars
  };

  getNewTransactionNotifications = async () => {
    const newTransactions = [];
    const { accountsState } = this.props;
    const regularAccount = accountsState[REGULAR_ACCOUNT].service.hdWallet;
    const secureAccount = accountsState[SECURE_ACCOUNT].service.secureHDWallet;

    const newTransactionsRegular =
      regularAccount.derivativeAccounts[FAST_BITCOINS][1] &&
      regularAccount.derivativeAccounts[FAST_BITCOINS][1].newTransactions;
    const newTransactionsSecure =
      secureAccount.derivativeAccounts[FAST_BITCOINS][1] &&
      secureAccount.derivativeAccounts[FAST_BITCOINS][1].newTransactions;

    if (newTransactionsRegular && newTransactionsRegular.length)
      newTransactions.push(...newTransactionsRegular);
    if (newTransactionsSecure && newTransactionsSecure.length)
      newTransactions.push(...newTransactionsSecure);

    if (newTransactions.length) {
      // let asyncNotification = notificationListNew;
      const asyncNotification = JSON.parse(
        await AsyncStorage.getItem("notificationList")
      );
      let asyncNotificationList = [];
      if (asyncNotification.length) {
        asyncNotificationList = [];
        for (let i = 0; i < asyncNotification.length; i++) {
          asyncNotificationList.push(asyncNotification[i]);
        }
      }

      for (let i = 0; i < newTransactions.length; i++) {
        let present = false;
        for (const tx of asyncNotificationList) {
          if (
            tx.notificationsData &&
            newTransactions[i].txid === tx.notificationsData.txid
          )
            present = true;
        }
        if (present) continue;

        const obj = {
          type: "contact",
          isMandatory: false,
          read: false,
          title: "Alert from FastBitcoins",
          time: timeFormatter(moment(new Date()), moment(new Date()).valueOf()),
          date: new Date(),
          info: "You have a new transaction",
          notificationId: createRandomString(17),
          notificationsData: newTransactions[i],
        };
        asyncNotificationList.push(obj);
        const notificationDetails = {
          id: obj.notificationId,
          title: obj.title,
          body: obj.info,
        };
        this.localNotification(notificationDetails);
      }
      //this.props.notificationsUpdated(asyncNotificationList);
      await AsyncStorage.setItem(
        "notificationList",
        JSON.stringify(asyncNotificationList)
      );
      asyncNotificationList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
      setTimeout(() => {
        this.setState({
          notificationData: asyncNotificationList,
          notificationDataChange: !this.state.notificationDataChange,
        });
      }, 2);
    }
  };

  localNotification = async (notificationDetails) => {
    const notification = new firebase.notifications.Notification()
      .setTitle(notificationDetails.title)
      .setBody(notificationDetails.body)
      .setNotificationId(notificationDetails.id)
      .setSound("default")
      .setData({
        title: notificationDetails.title,
        body: notificationDetails.body,
      })
      .android.setChannelId("reminder")
      .android.setPriority(firebase.notifications.Android.Priority.High);
    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    await firebase.notifications().scheduleNotification(notification, {
      fireDate: date.getTime(),
    });

    firebase
      .notifications()
      .getScheduledNotifications()
      .then(() => {});
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      JSON.stringify(prevProps.levelHealth) !==
      JSON.stringify(this.props.levelHealth)
    ) {
      if (
        this.props.levelHealth.length > 0 &&
        this.props.levelHealth.length == 1 &&
        prevProps.levelHealth.length == 0
      ) {
        this.cloudData();
      }
    }

    if (
      prevProps.notificationList !== this.props.notificationList ||
      prevProps.releaseCasesValue !== this.props.releaseCasesValue
    ) {
      this.setupNotificationList();
    }

    if ( prevProps.accountsState !== this.props.accountsState ) {
      // this.getBalances()
      // this.getNewTransactionNotifications()
    }

    if (prevProps.fcmTokenValue !== this.props.fcmTokenValue) {
      this.storeFCMToken();
    }

    if (
      prevProps.secondaryDeviceAddressValue !==
      this.props.secondaryDeviceAddressValue
    ) {
      this.setSecondaryDeviceAddresses();
    }

    if (this.props.paymentDetails !== null && this.props.paymentDetails) {
      const serviceType = REGULAR_ACCOUNT;
      const {
        paymentDetails,
        accountsState,
        navigation,
        addTransferDetails,
        clearPaymentDetails,
      } = this.props;
      let { address, paymentURI } = paymentDetails;
      let options: any = {};
      if (paymentURI) {
        try {
          const details = accountsState[serviceType].service.decodePaymentURI(
            paymentURI
          );
          address = details.address;
          options = details.options;
        } catch (err) {
          Alert.alert("Unable to decode payment URI");
          return;
        }
      }

      const item = {
        id: address,
      };

      addTransferDetails(serviceType, {
        selectedContact: item,
      });

      clearPaymentDetails();

      navigation.navigate("SendToContact", {
        selectedContact: item,
        serviceType,
        bitcoinAmount: options.amount
          ? `${Math.round(options.amount * SATOSHIS_IN_BTC)}`
          : "",
      });
    }
  };

  handleDeepLinkModal = () => {
    const custodyRequest = this.props.navigation.getParam("custodyRequest");
    const recoveryRequest = this.props.navigation.getParam("recoveryRequest");
    const trustedContactRequest = this.props.navigation.getParam(
      "trustedContactRequest"
    );
    const userKey = this.props.navigation.getParam("userKey");

    if (custodyRequest) {
      this.setState(
        {
          custodyRequest,
        },
        () => {
          this.openBottomSheetOnLaunch(BottomSheetKind.CUSTODIAN_REQUEST);
        }
      );
    } else if (recoveryRequest || trustedContactRequest) {
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          );
        }
      );
    } else if (userKey) {
      this.props.navigation.navigate("VoucherScanner", {
        userKey,
      });
    }
  };

  cleanupListeners() {
    if (typeof this.focusListener === "function") {
      this.props.navigation.removeListener("didFocus", this.focusListener);
    }

    if (typeof this.appStateListener === "function") {
      AppState.removeEventListener("change", this.appStateListener);
    }

    Linking.removeEventListener("url", this.handleDeepLinkEvent);

    clearTimeout(this.openBottomSheetOnLaunchTimeout);
    if (this.firebaseNotificationListener) {
      this.firebaseNotificationListener();
    }
  }

  componentWillUnmount() {
    this.cleanupListeners();
  }

  openBottomSheetOnLaunch(
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) {
    this.openBottomSheetOnLaunchTimeout = setTimeout(() => {
      this.openBottomSheet(kind, snapIndex);
    }, BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY);
  }

  handleDeepLinkEvent = async ({ url }) => {
    console.log("Home::handleDeepLinkEvent::URL: ", url);

    const { navigation, isFocused } = this.props;

    // If the user is on one of Home's nested routes, and a
    // deep link is opened, we will navigate back to Home first.
    if (!isFocused) {
      navigation.dispatch(
        resetToHomeAction({
          unhandledDeepLinkURL: url,
        })
      );
    } else {
      this.handleDeepLinking(url);
    }
  };

  handleDeepLinking = async (url: string | null) => {
    if (url == null) {
      return;
    }

    console.log("Home::handleDeepLinking::URL: " + url);

    const splits = url ? url.split("/") : [];

    if (splits[5] === "sss") {
      const requester = splits[4];

      if (splits[6] === "ek") {
        const custodyRequest = {
          requester,
          ek: splits[7],
          uploadedAt: splits[8],
        };

        this.setState(
          {
            custodyRequest,
          },
          () => {
            this.openBottomSheetOnLaunch(BottomSheetKind.CUSTODIAN_REQUEST);
          }
        );
      } else if (splits[6] === "rk") {
        const recoveryRequest = {
          requester,
          rk: splits[7],
        };

        this.setState(
          {
            recoveryRequest,
            trustedContactRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            );
          }
        );
      }
    } else if (["tc", "tcg", "atcg", "ptc"].includes(splits[4])) {
      if (splits[3] !== config.APP_STAGE) {
        Alert.alert(
          "Invalid deeplink",
          `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
            splits[3]
          }`
        );
      } else {
        const version = splits.pop().slice(1);

        if (version) {
          const isAppVersionCompatible = await checkAppVersionCompatibility({
            relayCheckMethod: splits[4],
            version,
          });

          if (!isAppVersionCompatible) {
            return;
          }
        }
        let hint = splits[8];
        let isFromKeeper = false;
        if(splits[8].includes('_')){
          let hintStr = splits[8].split("_");
          hint = hintStr[0];
          isFromKeeper = hintStr[1] == 'keeper' ? true : false;
        }

        const trustedContactRequest = {
          isGuardian: ["tcg", "atcg"].includes(splits[4]),
          approvedTC: splits[4] === "atcg" ? true : false,
          isPaymentRequest: splits[4] === "ptc" ? true : false,
          requester: splits[5],
          encryptedKey: splits[6],
          hintType: splits[7],
          hint,
          uploadedAt: splits[9],
          version,
          isFromKeeper
        };

        this.setState(
          {
            trustedContactRequest,
            recoveryRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            );
          }
        );
      }
    } else if (splits[4] === "rk") {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[5],
        encryptedKey: splits[6],
        hintType: splits[7],
        hint: splits[8],
      };

      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          );
        }
      );
    } else if (splits[4] === "rrk") {
      Alert.alert(
        "Restoration link Identified",
        "Restoration links only works during restoration mode"
      );
    }

    if (url && url.includes("fastbitcoins")) {
      const userKey = url.substr(url.lastIndexOf("/") + 1);
      this.props.navigation.navigate("VoucherScanner", { userKey });
    }
  };

  setUpFocusListener = () => {
    const { navigation } = this.props;

    this.focusListener = navigation.addListener("didFocus", () => {
      this.setCurrencyCodeFromAsync();
      this.props.fetchNotifications();
      this.setState({
        lastActiveTime: moment().toISOString(),
      });
    });

    this.setCurrencyCodeFromAsync();
  };

  setSecondaryDeviceAddresses = async () => {
    let secondaryDeviceOtpTemp = this.props.secondaryDeviceAddressValue;

    if (!secondaryDeviceOtpTemp) {
      secondaryDeviceOtpTemp = [];
    }
    if (
      secondaryDeviceOtpTemp.findIndex(
        (value) => value.otp == (this.state.secondaryDeviceOtp as any).otp
      ) == -1
    ) {
      secondaryDeviceOtpTemp.push(this.state.secondaryDeviceOtp);
      this.props.setSecondaryDeviceAddress(secondaryDeviceOtpTemp);
    }
  };

  getAssociatedContact = async () => {
    // TODO -- need to check this
    this.setSecondaryDeviceAddresses();
  };

  setCurrencyCodeFromAsync = async () => {
    const { currencyCode } = this.props
    if ( !currencyCode ) {
      this.props.setCurrencyCode( RNLocalize.getCurrencies()[ 0 ] )
      this.setState( {
        currencyCode: RNLocalize.getCurrencies()[ 0 ],
      } )
    } else {
      this.setState( {
        currencyCode: currencyCode,
      } )
    }
  };

  bootStrapNotifications = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (!enabled) {
      await firebase
        .messaging()
        .requestPermission()
        .then(() => {
          // User has authorized
          this.createNotificationListeners();
          this.storeFCMToken();
          this.scheduleNotification();
        })
        .catch(() => {});
    } else {
      this.createNotificationListeners();
      this.storeFCMToken();
      this.scheduleNotification();
    }
  };

  storeFCMToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    const fcmArray = [fcmToken];
    const fcmTokenFromAsync = this.props.fcmTokenValue;
    if (!fcmTokenFromAsync || fcmTokenFromAsync != fcmToken) {
      this.props.setFCMToken(fcmToken);

      await AsyncStorage.setItem("fcmToken", fcmToken);
      this.props.updateFCMTokens(fcmArray);

      AsyncStorage.getItem("walletRecovered").then((recovered) => {
        // updates the new FCM token to channels post recovery
        if (recovered) {
          this.props.postRecoveryChannelSync();
        }
      });
    }
  };

  onNotificationArrives = async (notification) => {
    console.log("*-* notification has been received ", {
      notification,
    });
    this.props.fetchNotifications();
    const { title, body } = notification;
    const deviceTrayNotification = new firebase.notifications.Notification()
      .setTitle(title)
      .setBody(body)
      .setNotificationId(notification.notificationId)
      .setSound("default")
      .android.setPriority(firebase.notifications.Android.Priority.High)
      .android.setChannelId(
        notification.android.channelId
          ? notification.android.channelId
          : "foregroundNotification"
      ) // previously created
      .android.setAutoCancel(true); // To remove notification when tapped on it

    const channelId = new firebase.notifications.Android.Channel(
      notification.android.channelId,
      notification.android.channelId ? "Reminder" : "ForegroundNotification",
      firebase.notifications.Android.Importance.High
    );
    firebase.notifications().android.createChannel(channelId);
    firebase.notifications().displayNotification(deviceTrayNotification);
  };

  createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.firebaseNotificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        this.onNotificationArrives(notification);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(async (notificationOpen) => {
        this.props.fetchNotifications();
        this.onNotificationOpen(notificationOpen.notification);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      this.props.fetchNotifications();
      this.onNotificationOpen(notificationOpen.notification);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    firebase.messaging().onMessage(async (remoteMessage) => {
      // console.log('A new FCM message arrived!',remoteMessage);
    });
  };

  onNotificationOpen = async (item) => {
    const content = JSON.parse(item._data.content);
    // let asyncNotificationList = notificationListNew;
    let asyncNotificationList = JSON.parse(
      await AsyncStorage.getItem("notificationList")
    );
    if (!asyncNotificationList) {
      asyncNotificationList = [];
    }
    let readStatus = true;
    if (
      content.notificationType == releaseNotificationTopic ||
      content.notificationType == "secureXpub"
    ) {
      let releaseCases = this.props.releaseCasesValue;
      //JSON.parse(await AsyncStorage.getItem('releaseCases'));
      if (releaseCases.ignoreClick) {
        readStatus = true;
      } else if (releaseCases.remindMeLaterClick) {
        readStatus = false;
      } else {
        readStatus = false;
      }
    }
    const obj = {
      type: content.notificationType,
      isMandatory: false,
      read: readStatus,
      title: item.title,
      time: timeFormatter(moment(new Date()), moment(new Date()).valueOf()),
      date: new Date(),
      info: item.body,
      notificationId: content.notificationId,
    };
    asyncNotificationList.push(obj);
    // this.props.notificationsUpdated(asyncNotificationList);

    await AsyncStorage.setItem(
      "notificationList",
      JSON.stringify(asyncNotificationList)
    );
    asyncNotificationList.sort(function (left, right) {
      return moment.utc(right.date).unix() - moment.utc(left.date).unix();
    });
    this.setState({
      notificationData: asyncNotificationList,
      notificationDataChange: !this.state.notificationDataChange,
    });
    this.onPressNotifications();
  };

  getBalances = () => {
    const { accountsState } = this.props;

    let testBalance = accountsState[TEST_ACCOUNT].service
      ? accountsState[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accountsState[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;

    const testTransactions = accountsState[TEST_ACCOUNT].service
      ? accountsState[TEST_ACCOUNT].service.hdWallet.transactions
          .transactionDetails
      : [];

    if (!testTransactions.length) testBalance = 10000; // hardcoding t-balance (till t-faucet saga syncs)

    let regularBalance = accountsState[REGULAR_ACCOUNT].service
      ? accountsState[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accountsState[REGULAR_ACCOUNT].service.hdWallet.balances
          .unconfirmedBalance
      : 0;

    // regular derivative accounts
    for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
      const derivativeAccount =
        accountsState[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
          dAccountType
        ];
      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if (derivativeAccount[accountNumber].balances) {
            regularBalance +=
              derivativeAccount[accountNumber].balances.balance +
              derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }

    let secureBalance = accountsState[SECURE_ACCOUNT].service
      ? accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;

    // secure derivative accounts
    for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
      if (dAccountType === TRUSTED_CONTACTS) continue;

      const derivativeAccount =
        accountsState[SECURE_ACCOUNT].service.secureHDWallet.derivativeAccounts[
          dAccountType
        ];

      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if (derivativeAccount[accountNumber].balances) {
            secureBalance +=
              derivativeAccount[accountNumber].balances.balance +
              derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }

    // donation transactions
    let additionalBalances = 0;

    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts =
        accountsState[serviceType].service[
          serviceType === SECURE_ACCOUNT ? "secureHDWallet" : "hdWallet"
        ].derivativeAccounts;

      for (const additionAcc of config.EJECTED_ACCOUNTS) {
        if (!derivativeAccounts[additionAcc]) continue;

        for (
          let index = 1;
          index <= derivativeAccounts[additionAcc].instance.using;
          index++
        ) {
          const account = derivativeAccounts[additionAcc][index];

          if (account.balances) {
            additionalBalances +=
              account.balances.balance + account.balances.unconfirmedBalance;
          }
        }
      }
    }

    const accumulativeBalance =
      regularBalance + secureBalance + additionalBalances;

    this.setState({
      balances: {
        testBalance,
        regularBalance,
        secureBalance,
        accumulativeBalance,
      },
    });
  };

  onNotificationListOpen = async () => {
    // let asyncNotificationList = notificationListNew;
    const asyncNotificationList = JSON.parse(
      await AsyncStorage.getItem("notificationList")
    );
    if (asyncNotificationList) {
      for (let i = 0; i < asyncNotificationList.length; i++) {
        if (asyncNotificationList[i]) {
          asyncNotificationList[i].time = timeFormatter(
            moment(new Date()),
            moment(asyncNotificationList[i].date).valueOf()
          );
        }
      }
      // this.props.notificationsUpdated(asyncNotificationList);

      await AsyncStorage.setItem(
        "notificationList",
        JSON.stringify(asyncNotificationList)
      );
      asyncNotificationList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });

      this.setState({
        notificationData: asyncNotificationList,
        notificationDataChange: !this.state.notificationDataChange,
      });
    }
  };

  onTrustedContactRequestAccepted = (key) => {
    this.closeBottomSheet();
    this.processDLRequest(key, false);
  };

  onTrustedContactRejected = () => {
    this.closeBottomSheet();
  };

  onPhoneNumberChange = () => {};

  handleBottomTabSelection = (tab: BottomTab) => {
    this.setState({
      selectedBottomTab: tab,
    });

    if (tab === BottomTab.Transactions) {
      this.props.navigation.navigate("AllTransactions");
    } else if (tab === BottomTab.More) {
      this.props.navigation.navigate("MoreOptions");
    } else if (tab === BottomTab.QR) {
      this.props.navigation.navigate("QRScanner", {
        onCodeScanned: this.processQRData,
      });
    } else if (tab === BottomTab.Add) {
      this.openBottomSheet(BottomSheetKind.TAB_BAR_ADD_MENU);
    }
  };

  processDLRequest = (key, rejected) => {
    const { trustedContactRequest, recoveryRequest } = this.state;
    let {
      requester,
      isGuardian,
      approvedTC,
      encryptedKey,
      publicKey,
      info,
      isQR,
      uploadedAt,
      isRecovery,
      version,
      isFromKeeper
    } = trustedContactRequest || recoveryRequest;
    const {
      UNDER_CUSTODY,
      uploadRequestedShare,
      navigation,
      approveTrustedContact,
      fetchTrustedChannel,
      walletName,
      trustedContacts,
      updateMSharesHealth,
    } = this.props;

    if (!isRecovery) {
      if (requester === walletName) {
        Toast("Cannot be your own Contact/Guardian");
        return;
      }

      let expiry = config.TC_REQUEST_EXPIRY;
      if (!semver.valid(version)) {
        // expiry support for 0.7, 0.9 and 1.0
        expiry = config.LEGACY_TC_REQUEST_EXPIRY;
      }

      if (uploadedAt && Date.now() - uploadedAt > expiry) {
        Alert.alert(
          `${isQR ? "QR" : "Link"} expired!`,
          `Please ask the sender to initiate a new ${isQR ? "QR" : "Link"}`
        );
      } else {
        if (isGuardian && UNDER_CUSTODY[requester]) {
          Alert.alert(
            "Failed to accept",
            `You already custody a share against the wallet name: ${requester}`
          );
        } else {
          if (!publicKey) {
            try {
              publicKey = TrustedContactsService.decryptPub(encryptedKey, key)
                .decryptedPub;
              info = key;
            } catch (err) {
              Alert.alert(
                "Invalid Number/Email",
                "Decryption failed due to invalid input, try again."
              );
              return;
            }
          }

          let existingContactName;
          Object.keys(trustedContacts.tc.trustedContacts).forEach(
            (contactName) => {
              const contact = trustedContacts.tc.trustedContacts[contactName];
              if (contact.contactsPubKey === publicKey) {
                existingContactName = contactName;
              }
            }
          );
          if (existingContactName && !approvedTC) {
            Toast("Contact already exists against this request");
            return;
          }

          if (publicKey && !rejected) {
            if (!approvedTC) {
              navigation.navigate("ContactsListForAssociateContact", {
                postAssociation: (contact) => {
                  let contactName = "";
                  if (contact) {
                    contactName = `${contact.firstName} ${
                      contact.lastName ? contact.lastName : ""
                    }`
                      .toLowerCase()
                      .trim();
                  } else {
                    // contactName = `${requester}'s Wallet`.toLowerCase();
                    Alert.alert("Contact association failed");
                    return;
                  }
                  if (!semver.valid(version)) {
                    // for 0.7, 0.9 and 1.0: info remains null
                    info = null;
                  }

                  const contactInfo = {
                    contactName,
                    info,
                  };

                  approveTrustedContact(
                    contactInfo,
                    publicKey,
                    true,
                    requester,
                    isGuardian,
                    isFromKeeper
                  );
                },
                isGuardian,
              });
            } else {
              if (!existingContactName) {
                Alert.alert(
                  "Invalid Link/QR",
                  "You are not a valid trusted contact for approving this request"
                );
                return;
              }
              const contactInfo = {
                contactName: existingContactName,
                info,
              };

              fetchTrustedChannel(
                contactInfo,
                trustedChannelActions.downloadShare,
                requester
              );
            }
          } else if (publicKey && rejected) {
            // don't associate; only fetch the payment details from EC
            // fetchEphemeralChannel(null, null, publicKey);
          }
        }
      }
    } else {
      if (requester === walletName) {
        Toast("You do not host any key of your own");
        return;
      }

      if (!UNDER_CUSTODY[requester]) {
        this.setState(
          {
            errorMessageHeader: `You do not custody a share with the wallet name ${requester}`,
            errorMessage:
              "Request your contact to send the request again with the correct wallet name or help them manually restore by going into Friends and Family > I am the Keeper of > Help Restore",
          },
          () => {
            this.openBottomSheet(BottomSheetKind.ERROR);
          }
        );
      } else {
        if (!publicKey) {
          try {
            publicKey = TrustedContactsService.decryptPub(encryptedKey, key)
              .decryptedPub;
          } catch (err) {
            Alert.alert(
              "Invalid Number/Email",
              "Decryption failed due to invalid input, try again."
            );
          }
        }
        if (publicKey) {
          uploadRequestedShare(recoveryRequest.requester, publicKey);
        }
      }
    }
  };

  handleAccountCardSelection = (selectedAccount: AccountShell) => {
    this.props.navigation.navigate("AccountDetails", {
      accountShellID: selectedAccount.id,
    });
  };

  handleBottomSheetPositionChange = (newIndex: number) => {
    if (newIndex === 0) {
      this.onBottomSheetClosed();
    }
  };

  openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) => {
    this.setState(
      {
        bottomSheetState: BottomSheetState.Open,
        currentBottomSheetKind: kind,
      },
      () => {
        if (snapIndex == null) {
          this.bottomSheetRef.current?.expand();
        } else {
          this.bottomSheetRef.current?.snapTo(snapIndex);
        }
      }
    );
  };

  onBottomSheetClosed() {
    this.setState({
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
    });
  }

  closeBottomSheet = () => {
    this.bottomSheetRef.current?.close();
    this.onBottomSheetClosed();
  };

  onNotificationClicked = async (value) => {
    let asyncNotifications = JSON.parse(
      await AsyncStorage.getItem("notificationList")
    );
    console.log("Notification clicked Home>onNotificationClicked");
    console.log("asyncNotifications ", asyncNotifications);
    console.log("notification passed ", value);

    const { notificationData } = this.state;
    const {
      navigation,
      s3Service,
      fetchKeeperTrustedChannel,
      levelHealth,
    } = this.props;
    let tempNotificationData = notificationData;
    for (let i = 0; i < tempNotificationData.length; i++) {
      const element = tempNotificationData[i];
      if (element.notificationId == value.notificationId) {
        if (
          asyncNotifications &&
          asyncNotifications.length &&
          asyncNotifications.findIndex(
            (item) => item.notificationId == value.notificationId
          ) > -1
        ) {
          asyncNotifications[
            asyncNotifications.findIndex(
              (item) => item.notificationId == value.notificationId
            )
          ].read = true;
        }
        tempNotificationData[i].read = true;
      }
    }

    await AsyncStorage.setItem(
      "notificationList",
      JSON.stringify(asyncNotifications)
    );

    this.setState({
      notificationData: tempNotificationData,
      notificationDataChange: !this.state.notificationDataChange,
    });

    if (value.info && value.info.includes("F&F request accepted by")) {
      navigation.navigate("FriendsAndFamily");
      return;
    }

    if (value.type == releaseNotificationTopic) {
      RelayServices.fetchReleases(value.info.split(" ")[1])
        .then(async (res) => {
          if (res.data.releases.length) {
            const releaseNotes = res.data.releases.length
              ? res.data.releases.find((el) => {
                  return el.build === value.info.split(" ")[1];
                })
              : "";
            navigation.navigate("UpdateApp", {
              releaseData: [releaseNotes],
              isOpenFromNotificationList: true,
              releaseNumber: value.info.split(" ")[1],
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (value.type == "contact") {
      this.closeBottomSheet();
    }
    if (
      value.type == "secureXpub" &&
      !this.props.secureAccount.secureHDWallet.xpubs.secondary
    ) {
      this.bottomSheetRef.current?.close();
      let shareId = s3Service.levelhealth.metaSharesKeeper[1].shareId;
      let share = getKeeperInfoFromShareId(levelHealth, shareId);
      fetchKeeperTrustedChannel(shareId, value.type, share.name);
    }
  };

  updateHealthForCloud = (share?) => {
    let levelHealth = this.props.levelHealth;
    let levelHealthVar = levelHealth[0].levelInfo[0];
    if (
      share &&
      !(Object.keys(share).length === 0 && share.constructor === Object) &&
      levelHealth.length > 0
    ) {
      levelHealthVar = levelHealth[levelHealth.length - 1].levelInfo[0];
    }
    // health update for 1st upload to cloud
    if (
      this.props.cloudBackupStatus &&
      levelHealth.length &&
      !this.props.isLevel2Initialized &&
      levelHealthVar.status != "accessible"
    ) {
      if (levelHealthVar.shareType == "cloud") {
        levelHealthVar.updatedAt = moment(new Date()).valueOf();
        levelHealthVar.status = "accessible";
        levelHealthVar.reshareVersion = 0;
        levelHealthVar.name = "Cloud";
      }
      let shareArray = [
        {
          walletId: this.props.s3Service.getWalletId().data.walletId,
          shareId: levelHealthVar.shareId,
          reshareVersion: levelHealthVar.reshareVersion,
          updatedAt: moment(new Date()).valueOf(),
          status: "accessible",
          shareType: "cloud",
        },
      ];
      this.props.updateMSharesHealth(shareArray);
    }
  };

  onPressElement = (item) => {
    const { navigation } = this.props;
    if (item.title == "Backup Health") {
      navigation.navigate("ManageBackup");
      return;
    }
    if (item.title == "Friends and Family") {
      navigation.navigate("AddressBookContents");
      return;
    } else if (item.title == "Wallet Settings") {
      navigation.navigate("SettingsContents");
      // this.settingsBottomSheetRef.current?.snapTo(1);
      // setTimeout(() => {
      //   this.setState({
      //     tabBarIndex: 0,
      //   });
      // }, 10);
    } else if (item.title == "Funding Sources") {
      navigation.navigate("ExistingSavingMethods");
    } else if (item.title === "Hexa Community (Telegram)") {
      let url = "https://t.me/HexaWallet";
      Linking.openURL(url)
        .then((data) => {})
        .catch((e) => {
          alert("Make sure Telegram installed on your device");
        });
      return;
    }
  };

  setupNotificationList = async () => {
    let {
      releaseCasesValue,
      keeperApproveStatus,
      onApprovalStatusChange,
      s3Service,
      levelHealth,
      notificationList,
      fetchKeeperTrustedChannel,
      secureAccount,
      UNDER_CUSTODY,
    } = this.props;
    // let asyncNotification = notificationListNew;
    const asyncNotification = JSON.parse(
      await AsyncStorage.getItem("notificationList")
    );
    let asyncNotificationList = [];
    if (asyncNotification) {
      asyncNotificationList = [];
      for (let i = 0; i < asyncNotification.length; i++) {
        asyncNotificationList.push(asyncNotification[i]);
      }
    }
    let tmpList = asyncNotificationList;
    if (notificationList) {
      // console.log(
      //   "notificationList['notifications']",
      //   notificationList["notifications"]
      // );
      for (let i = 0; i < notificationList["notifications"].length; i++) {
        const element = notificationList["notifications"][i];
        // console.log("element", element);
        let readStatus = false;
        if (element.notificationType == releaseNotificationTopic) {
          let releaseCases = this.props.releaseCasesValue;
          // JSON.parse(
          //   await AsyncStorage.getItem('releaseCases'),
          // );
          if (
            element.body &&
            element.body.split(" ")[1] == releaseCases.build
          ) {
            if (releaseCases.remindMeLaterClick) {
              readStatus = false;
            }
            if (releaseCases.ignoreClick) {
              readStatus = true;
            }
          } else {
            readStatus = true;
          }
        }
        if (element.notificationType == "uploadSecondaryShare") {
          let data = JSON.parse(element.data);
          if (data.shareID == keeperApproveStatus.shareId) {
            onApprovalStatusChange(
              true,
              moment(new Date()).valueOf(),
              data.shareID
            );
          }
        }
        if (
          element.notificationType == "secureXpub" &&
          !secureAccount.secureHDWallet.xpubs.secondary
        ) {
          let shareId = s3Service.levelhealth.metaSharesKeeper[1].shareId;
          let share = getKeeperInfoFromShareId(levelHealth, shareId);
          fetchKeeperTrustedChannel(
            shareId,
            element.notificationType,
            share.name
          );
        }
        if (element.notificationType == "reShare") {
          let existingShares: MetaShare[];
          if (Object.keys(UNDER_CUSTODY).length) {
            existingShares = Object.keys(UNDER_CUSTODY).map((tag) => {
              console.log(tag);
              return UNDER_CUSTODY[tag].META_SHARE;
            });
          }
          if (
            existingShares &&
            existingShares.findIndex(
              (value) =>
                value.shareId == JSON.parse(element.data).selectedShareId
            ) > -1
          ) {
            this.props.autoDownloadShareContact(
              JSON.parse(element.data).selectedShareId,
              JSON.parse(element.data).walletId
            );
          }
        }
        if (
          asyncNotificationList.findIndex(
            (value) => value.notificationId == element.notificationId
          ) > -1
        ) {
          const temp =
            asyncNotificationList[
              asyncNotificationList.findIndex(
                (value) => value.notificationId == element.notificationId
              )
            ];
          if (element.notificationType == releaseNotificationTopic) {
            readStatus = readStatus;
          } else {
            readStatus = temp.read;
          }
          const obj = {
            ...temp,
            read: readStatus,
            type: element.notificationType,
            title: element.title,
            info: element.body,
            isMandatory: element.tag == "mandatory" ? true : false,
            time: timeFormatter(
              moment(new Date()),
              moment(element.date).valueOf()
            ),
            date: new Date(element.date),
          };
          tmpList[
            tmpList.findIndex(
              (value) => value.notificationId == element.notificationId
            )
          ] = obj;
        } else {
          const obj = {
            type: element.notificationType,
            isMandatory: element.tag == "mandatory" ? true : false,
            read: readStatus,
            title: element.title,
            time: timeFormatter(
              moment(new Date()),
              moment(element.date).valueOf()
            ),
            date: new Date(element.date),
            info: element.body,
            notificationId: element.notificationId,
          };
          tmpList.push(obj);
        }
      }
      //this.props.notificationsUpdated(tmpList);
      await AsyncStorage.setItem("notificationList", JSON.stringify(tmpList));
      tmpList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });

      this.setState({
        notificationData: tmpList,
        notificationDataChange: !this.state.notificationDataChange,
      });
    }
  };

  getBottomSheetSnapPoints(): any[] {
    switch (this.state.currentBottomSheetKind) {
      case BottomSheetKind.TAB_BAR_ADD_MENU:
      case BottomSheetKind.CUSTODIAN_REQUEST:
      case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
        return defaultBottomSheetConfigs.snapPoints;

      case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
        return [
          -50,
          heightPercentageToDP(
            Platform.OS == "ios" && DeviceInfo.hasNotch ? 70 : 65
          ),
          heightPercentageToDP(95),
        ];

      case BottomSheetKind.ERROR:
        return [
          -50,
          heightPercentageToDP(
            Platform.OS == "ios" && DeviceInfo.hasNotch ? 40 : 35
          ),
        ];

      case BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK:
      case BottomSheetKind.NOTIFICATIONS_LIST:
        return [-50, heightPercentageToDP(82)];

      default:
        return defaultBottomSheetConfigs.snapPoints;
    }
  }

  renderBottomSheetContent() {
    const { UNDER_CUSTODY, navigation } = this.props;
    const { custodyRequest } = this.state;

    switch (this.state.currentBottomSheetKind) {
      case BottomSheetKind.TAB_BAR_ADD_MENU:
        return (
          <>
            <BottomSheetHeader title="Add" onPress={this.closeBottomSheet} />

            <AddModalContents
              onPressElements={(type) => {
                if (type == "buyBitcoins") {
                  navigation.navigate("VoucherScanner");
                } else if (type == "addContact") {
                  this.setState(
                    {
                      isLoadContacts: true,
                    },
                    () => {
                      this.openBottomSheet(
                        BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK
                      );
                    }
                  );
                }
              }}
            />
          </>
        );

      case BottomSheetKind.CUSTODIAN_REQUEST:
        return (
          <CustodianRequestModalContents
            userName={custodyRequest.requester}
            onPressAcceptSecret={() => {
              this.closeBottomSheet();

              if (Date.now() - custodyRequest.uploadedAt > 600000) {
                Alert.alert(
                  "Request expired!",
                  "Please ask the sender to initiate a new request"
                );
              } else {
                if (UNDER_CUSTODY[custodyRequest.requester]) {
                  Alert.alert(
                    "Failed to store",
                    "You cannot custody multiple shares of the same user."
                  );
                } else {
                  if (custodyRequest.isQR) {
                    downloadMShare(custodyRequest.ek, custodyRequest.otp);
                  } else {
                    navigation.navigate("CustodianRequestOTP", {
                      custodyRequest,
                    });
                  }
                }
              }
            }}
            onPressRejectSecret={() => {
              this.closeBottomSheet();
              this.openBottomSheet(BottomSheetKind.CUSTODIAN_REQUEST_REJECTED);
            }}
          />
        );

      case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
        return (
          <CustodianRequestRejectedModalContents
            onPressViewTrustedContacts={this.closeBottomSheet}
            userName={custodyRequest.requester}
          />
        );

      case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
        const { trustedContactRequest, recoveryRequest } = this.state;

        return (
          <TrustedContactRequestContent
            trustedContactRequest={trustedContactRequest}
            recoveryRequest={recoveryRequest}
            onPressAccept={this.onTrustedContactRequestAccepted}
            onPressReject={this.onTrustedContactRejected}
            onPhoneNumberChange={this.onPhoneNumberChange}
            bottomSheetRef={this.bottomSheetRef}
          />
        );

      case BottomSheetKind.NOTIFICATIONS_LIST:
        const { notificationLoading, notificationData } = this.state;

        return (
          <NotificationListContent
            notificationLoading={notificationLoading}
            NotificationData={notificationData}
            onNotificationClicked={this.onNotificationClicked}
            onPressBack={this.closeBottomSheet}
          />
        );

      case BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK:
        const { isLoadContacts, selectedContact } = this.state;

        return (
          <AddContactAddressBook
            isLoadContacts={isLoadContacts}
            proceedButtonText={"Confirm & Proceed"}
            onPressContinue={() => {
              if (selectedContact && selectedContact.length) {
                this.closeBottomSheet();

                navigation.navigate("AddContactSendRequest", {
                  SelectedContact: selectedContact,
                });
              }
            }}
            onSelectContact={(selectedContact) => {
              this.setState({
                selectedContact,
              });
            }}
            onPressBack={this.closeBottomSheet}
            onSkipContinue={() => {
              let { skippedContactsCount } = this.props.trustedContacts.tc;
              let data;
              if (!skippedContactsCount) {
                skippedContactsCount = 1;
                data = {
                  firstName: "F&F request",
                  lastName: `awaiting ${skippedContactsCount}`,
                  name: `F&F request awaiting ${skippedContactsCount}`,
                };
              } else {
                data = {
                  firstName: "F&F request",
                  lastName: `awaiting ${skippedContactsCount + 1}`,
                  name: `F&F request awaiting ${skippedContactsCount + 1}`,
                };
              }

              this.closeBottomSheet();

              navigation.navigate("AddContactSendRequest", {
                SelectedContact: [data],
              });
            }}
          />
        );

      case BottomSheetKind.ERROR:
        const { errorMessageHeader, errorMessage } = this.state;

        return (
          <ErrorModalContents
            title={errorMessageHeader}
            info={errorMessage}
            onPressProceed={this.closeBottomSheet}
            isBottomImage={true}
            bottomImage={require("../../assets/images/icons/errorImage.png")}
          />
        );
      default:
        break;
    }
  }

  render() {
    const {
      balances,
      selectedBottomTab,
      notificationData,
      currencyCode,
    } = this.state;

    const {
      navigation,
      exchangeRates,
      walletName,
      overallHealth,
      levelHealth,
      cardDataProps,
      currentLevel,
    } = this.props;

    return (
      <ImageBackground
        source={require("../../assets/images/home-bg.png")}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
        }}
        imageStyle={{
          resizeMode: "stretch",
        }}
      >
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View
          style={{
            flex: 3.8,
            paddingTop:
              Platform.OS == "ios" && DeviceInfo.hasNotch
                ? heightPercentageToDP("5%")
                : 0,
          }}
        >
          <HomeHeader
            onPressNotifications={this.onPressNotifications}
            notificationData={notificationData}
            walletName={walletName}
            getCurrencyImageByRegion={getCurrencyImageByRegion}
            balances={balances}
            exchangeRates={exchangeRates}
            CurrencyCode={currencyCode}
            navigation={navigation}
            currentLevel={currentLevel}
            //  onSwitchToggle={this.onSwitchToggle}
            // setCurrencyToggleValue={this.setCurrencyToggleValue}
            // navigation={this.props.navigation}
            // overallHealth={overallHealth}
          />
        </View>

        <HomeAccountCardsList
          containerStyle={styles.accountCardsSectionContainer}
          contentContainerStyle={{
            paddingTop: 36,
            paddingLeft: 14,
          }}
          currentLevel={currentLevel}
          onAddNewSelected={this.navigateToAddNewAccountScreen}
          onCardSelected={this.handleAccountCardSelection}
        />

        <View
          style={styles.floatingFriendsAndFamilyButtonContainer}
          pointerEvents="box-none"
        >
          <Button
            raised
            title="Friends & Family"
            icon={
              <Image
                source={require("../../assets/images/icons/icon_contact.png")}
                style={{
                  width: 18,
                  height: 18,
                }}
              />
            }
            buttonStyle={{
              ...ButtonStyles.floatingActionButton,
              borderRadius: 9999,
            }}
            titleStyle={{
              ...ButtonStyles.floatingActionButtonText,
              marginLeft: 4,
            }}
            onPress={() => navigation.navigate("FriendsAndFamily")}
          />
        </View>

        <BottomSheetBackground
          isVisible={this.state.bottomSheetState === BottomSheetState.Open}
          onPress={this.closeBottomSheet}
        />

        <CustomBottomTabs
          onSelect={this.handleBottomTabSelection}
          selectedTab={selectedBottomTab}
          tabBarZIndex={
            this.state.currentBottomSheetKind ==
              BottomSheetKind.TAB_BAR_ADD_MENU || null
              ? 1
              : 0
          }
        />

        {this.state.currentBottomSheetKind != null && (
          <BottomSheet
            ref={this.bottomSheetRef}
            snapPoints={this.getBottomSheetSnapPoints()}
            initialSnapIndex={-1}
            animationDuration={defaultBottomSheetConfigs.animationDuration}
            animationEasing={Easing.out(Easing.back(1))}
            handleComponent={defaultBottomSheetConfigs.handleComponent}
            onChange={this.handleBottomSheetPositionChange}
          >
            <BottomSheetView>{this.renderBottomSheetContent()}</BottomSheetView>
          </BottomSheet>
        )}
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notificationList: state.notifications,
    accountsState: state.accounts,
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    walletName:
      idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || "",
    UNDER_CUSTODY: idx(
      state,
      (_) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx(state, (_) => _.preferences.cardData),
    secureAccount: idx(state, (_) => _.accounts[SECURE_ACCOUNT].service),
    s3Service: idx(state, (_) => _.health.service),
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    paymentDetails: idx(state, (_) => _.trustedContacts.paymentDetails),
    notificationListNew: idx(state, (_) => _.notifications.notificationListNew),
    currencyCode: idx(state, (_) => _.preferences.currencyCode),
    fcmTokenValue: idx(state, (_) => _.preferences.fcmTokenValue),
    secondaryDeviceAddressValue: idx(
      state,
      (_) => _.preferences.secondaryDeviceAddressValue
    ),
    releaseCasesValue: idx(state, (_) => _.preferences.releaseCasesValue),
    cloudBackupStatus:
      idx(state, (_) => _.preferences.cloudBackupStatus) || false,
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    database: idx(state, (_) => _.storage.database) || {},
    levelHealth: idx(state, (_) => _.health.levelHealth),
    currentLevel: idx(state, (_) => _.health.currentLevel),
    keeperInfo: idx(state, (_) => _.health.keeperInfo),
    isLevel2Initialized: idx(state, (_) => _.health.isLevel2Initialized),
    isLevel3Initialized: idx(state, (_) => _.health.isLevel3Initialized),
    keeperApproveStatus: idx(state, (_) => _.health.keeperApproveStatus),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    fetchNotifications,
    updateFCMTokens,
    postRecoveryChannelSync,
    downloadMShare,
    approveTrustedContact,
    fetchTrustedChannel,
    uploadRequestedShare,
    initializeHealthSetup,
    initHealthCheck,
    fetchDerivativeAccBalTx,
    addTransferDetails,
    clearPaymentDetails,
    notificationsUpdated,
    setCurrencyCode,
    updatePreference,
    setFCMToken,
    setSecondaryDeviceAddress,
    updateLastSeen,
    setCloudBackupStatus,
    updateMSharesHealth,
    setCardData,
    fetchKeeperTrustedChannel,
    onApprovalStatusChange,
    autoDownloadShareContact,
  })(Home)
);

const styles = StyleSheet.create({
  accountCardsSectionContainer: {
    flex: 7,
    marginTop: 30,
    backgroundColor: Colors.backgroundColor,
    borderTopLeftRadius: 25,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
  },

  floatingFriendsAndFamilyButtonContainer: {
    position: "absolute",
    zIndex: 0,
    bottom: TAB_BAR_HEIGHT,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    padding: heightPercentageToDP(1),
  },
});
