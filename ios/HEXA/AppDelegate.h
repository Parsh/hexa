#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

//react-native-push-notification-ios
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
