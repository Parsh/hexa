import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Share from 'react-native-share';
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import QRCode from 'react-native-qrcode-svg'
import {
	REGULAR_ACCOUNT,
	TEST_ACCOUNT,
	SECURE_ACCOUNT,
} from '../common/constants/wallet-service-types'
import CopyThisText from '../components/CopyThisText'
import UserDetails from './UserDetails'

export default function RequestKeyFromContact(props) {
	const [contactName, setContactName] = useState('')
	const [shareLink, setShareLink] = useState('')
	// console.log('props.QR RequestKeyFromContact > ', props.QR);

	const contact = props.contact
	const [serviceType, setServiceType] = useState(
		props.serviceType ? props.serviceType : '',
	)
	//console.log("amountCurrency", props.amountCurrency);
	const [Contact, setContact] = useState(props.contact ? props.contact : {
	})

	useEffect(() => {
		setShareLink(props.link)
		// if ( props.infoText ) setInfoText( props.infoText )
	}, [props.link])

	useEffect(() => {
		if (contact) {
			setContact(props.contact)
		}
	}, [contact])

	useEffect(() => {
		if (props.serviceType) {
			setServiceType(props.serviceType)
		}
	}, [props.serviceType])

	useEffect(() => {
		const contactName =
			Contact && Contact.firstName && Contact.lastName
				? Contact.firstName + ' ' + Contact.lastName
				: Contact && Contact.firstName && !Contact.lastName
					? Contact.firstName
					: Contact && !Contact.firstName && Contact.lastName
						? Contact.lastName
						: ''
		setContactName(contactName)
	}, [Contact])

	const shareOption = async () => {
		try {
			// const url = 'https://awesome.contents.com/';
			const title = 'Request';

			const options = Platform.select({
				default: {
					title,
					message: `${shareLink}`,
				},
			});


			Share.open(options)
				.then((res) => {
					// if (res.success) {
					props.onPressShare()
					// }
				})
				.catch((err) => {
				});
		} catch (error) {
			// console.log(error);

		}
	}

	return (
		<View style={styles.modalContainer}>
			<View
				style={styles.mainView}
			>
				{props.isModal &&
					<View style={styles.topSubView}>
						<AppBottomSheetTouchableWrapper
							onPress={() => {
								props.onPressBack();
							}}
							style={styles.backButton}
						>
							<FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
						</AppBottomSheetTouchableWrapper>
						<View style={{
							flex: 1, marginLeft: 5
						}}>
							{props.headerText &&
								<Text style={styles.modalHeaderTitleText}>
									{props.headerText}
								</Text>
							}
							{props.subHeaderText &&
								<Text
									style={styles.subHeaderText}
								>
									{props.subHeaderText}
								</Text>
							}
						</View>
					</View>
				}
			</View>
			<View style={[styles.topContainer, {
				marginTop: !props.isModal ? 0 : hp('1.7%'),
				marginBottom: !props.isModal ? 0 : hp('1.7%'),
			}]}>
				<UserDetails
					titleStyle={styles.titleStyle}
					contactName={contactName}
					contactText={props.contactText}
					Contact={Contact} />
			</View>
			<ScrollView contentContainerStyle={{
				flex: 1
			}}>
				<View
					style={[styles.mainContainer,
					{
						marginTop: !props.isModal ? hp('2%') : hp('1.7%'),
						marginBottom: !props.isModal ? hp('2%') : hp('1.7%'),
					}]}
				>
					<View style={[styles.qrContainer, { marginTop: !props.isModal ? 0 : hp('4%') }]}>
						{!props.QR ? (
							<ActivityIndicator size="large" color={Colors.babyGray} />
						) : (
								<QRCode value={props.QR} size={hp('27%')} />
							)}
					</View>
					<CopyThisText
						openLink={shareLink ? shareOption : ()=> {}}
						backgroundColor={Colors.backgroundColor1}
						text={shareLink ? shareLink : 'Creating Link....'}
					/>
				</View>
			</ScrollView>

		</View>
	)
}
const styles = StyleSheet.create({
	titleStyle: {
		color: Colors.black,
		fontSize: RFValue(20),
		fontFamily: Fonts.FiraSansRegular,
		marginLeft: 25,
	},
	modalHeaderTitleText: {
		color: Colors.blue,
		fontSize: RFValue(18),
		fontFamily: Fonts.FiraSansRegular,
	},
	modalContainer: {
		height: '100%',
		backgroundColor: Colors.white,
		alignSelf: 'center',
		width: '100%',
	},
	qrContainer: {
		height: hp('27%'),
		justifyContent: 'center',
		marginLeft: 20,
		marginRight: 20,
		alignItems: 'center',
	},
	mainContainer: {
		marginLeft: 20,
		marginRight: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	topContainer: {
		marginHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	subHeaderText: {
		color: Colors.textColorGrey,
		fontSize: RFValue(12),
		fontFamily: Fonts.FiraSansRegular,
		paddingTop: 5,
	},
	mainView: {
		alignItems: 'center',
		flexDirection: 'row',
		paddingRight: 10,
		paddingBottom: hp('1.5%'),
		paddingTop: hp('1%'),
		marginLeft: 10,
		marginRight: 10,
		marginBottom: hp('1.5%'),
	},
	backButton: {
		height: 30,
		width: 30,
		justifyContent: 'center'
	},
	topSubView: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start'
	}
})
