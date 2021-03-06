import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator, SwitchNavigator } from 'react-navigation';
import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import SignInScreen from '../screens/SignInScreen';
import FirstTimeScreen from '../screens/FirstTimeScreen';


const AuthStack = StackNavigator({ 
    SignIn: {
      screen: SignInScreen,
    },
    FirstTime: {
    screen: FirstTimeScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
      }
    },
   },
);

const RootSwitchNavigator = SwitchNavigator(
  {
    Main: {
      screen: MainTabNavigator,
    },
    Auth: AuthStack,
  },
  {
    initialRouteName: 'Auth',
  }
);

export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      if (body === '') {
        originalSend.call(this);
      } else {
        originalSend.call(this, body);
      }
    };
    return <RootSwitchNavigator/>
;
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({ origin, data }) => {
    console.log(`Push notification ${origin} with data: ${JSON.stringify(data)}`);
  };
}
