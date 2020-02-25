import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Clipboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import Toast from '../../components/Toast';

export default function ShareRecoveryOTP(props) {
  const OTP = props.navigation.getParam('OTP');
  const writeToClipboard = () => {
    Clipboard.setString(OTP);
    Toast('Copied Successfully');
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                // props.onPressBack();
                // props.navigation.navigate('RestoreSelectedContactsList');
                props.navigation.goBack();
              }}
              style={{ height: 30, width: 30 }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </AppBottomSheetTouchableWrapper>
            <View>
              <Text style={styles.modalHeaderTitleText}>
                Share OTP with{'\n'}trusted contact
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Please provide this OTP to your trusted contact in order for
                them to send you the recovery secret
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 30, marginRight: 30 }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => writeToClipboard()}
            style={styles.otpView}
          >
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[0]}</Text>
            </View>
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[1]}</Text>
            </View>
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[2]}</Text>
            </View>
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[3]}</Text>
            </View>
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[4]}</Text>
            </View>
            <View style={styles.otpTextView}>
              <Text style={styles.otpText}>{OTP[5]}</Text>
            </View>
          </AppBottomSheetTouchableWrapper>
          <Text
            numberOfLines={2}
            style={{ ...styles.modalHeaderInfoText, marginBottom: hp('5%') }}
          >
            Tap on OTP to copy
          </Text>
          <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
            This OTP is only valid for 10 minutes, if the OTP{'\n'}expires you
            will be asked to create a new one
          </Text>
          <View style={styles.separator} />
          <View style={styles.bottomView}>
            <View style={styles.bottomInnerView}>
              <Ionicons color={Colors.blue} size={17} name={'md-time'} />
              <Text style={styles.timerText}>09 : 12</Text>
            </View>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                props.navigation.navigate('RestoreSelectedContactsList');
              }}
              style={{
                backgroundColor: Colors.blue,
                borderRadius: 10,
                width: wp('50%'),
                height: wp('13%'),
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                marginBottom: hp('3%'),
                elevation: 10,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: { width: 15, height: 15 },
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansMedium,
                }}
              >
                Yes, I have shared
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    marginTop: hp('3%'),
    width: '100%',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('3%'),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
    marginRight: 20,
    flexWrap: 'wrap',
  },
  qrModalImage: {
    width: wp('100%'),
    height: wp('100%'),
    borderRadius: 20,
  },
  otpText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(23),
  },
  otpTextView: {
    height: wp('12%'),
    width: wp('12%'),
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('5%'),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderColor,
    marginTop: hp('5%'),
    marginBottom: hp('3%'),
  },
  bottomView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomInnerView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerText: {
    color: Colors.blue,
    fontSize: RFValue(19),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
});
