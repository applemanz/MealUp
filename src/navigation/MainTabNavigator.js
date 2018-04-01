import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import RequestsScreen from '../screens/RequestsScreen';
import FreeTimeScreen from '../screens/FreeTimeScreen';
import RequestByFriendScreen from '../screens/RequestByFriendScreen';
import RequestByTimeScreen from '../screens/RequestByTimeScreen';
import FinalRequestScreen from '../screens/FinalRequestScreen';
import FriendChosenScreen from '../screens/FriendChosenScreen';
import TimeChosenScreen from '../screens/TimeChosenScreen';

export const RequestsStack = StackNavigator({
  Requests: {
    screen: RequestsScreen,
    navigationOptions: {
      header: null,
    }
  },
  RequestByFriend: {
    screen: RequestByFriendScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
    }
  },
  RequestByTime: {
    screen: RequestByTimeScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
    }
  },
  FriendChosen: {
    screen: FriendChosenScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
    }
  },
  TimeChosen: {
    screen: TimeChosenScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
    }
  },
  FinalRequest: {
    screen: FinalRequestScreen,
    navigationOptions: {
      header: null,
      tabBarVisible: false
    }
  },
},
{
    initialRouteName: 'Requests',
});

// const RequestsStack = StackNavigator({
//   Requests: { screen: RequestsScreen },
//   RequestOptions: {screen: RequestOptionsScreen },
//   RequestbyFriend: { screen: RequestbyFriendScreen },
//   RequestbyTime: { screen: RequestbyTimeScreen },
//   FriendChosen: {screen:FriendChosenScreen },
//   TimeChosen: {screen:TimeChosenScreen},
//   FinalRequest: {screen:FinalRequestScreen}
// });

export default TabNavigator(
  {
    Meals: {
      screen: HomeScreen,
    },
    Requests: {
      screen: RequestsStack,
    },
    Friends: {
      screen: FriendsScreen,
    },
    FreeTime: {
      screen: FreeTimeScreen
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Meals':
            iconName = 'ios-home';
            break;
          case 'Friends':
            iconName = Platform.OS === 'ios' ? `ios-contacts` : 'md-contacts';
            break;
          case 'Requests':
            iconName =
              Platform.OS === 'ios' ? `ios-notifications` : 'md-notifications';
              break;
          case 'FreeTime':
          iconName =
            Platform.OS === 'ios' ? `ios-time` : 'md-time';
          }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },

    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    headerTitleStyle: {fontWeight: 'bold'},
  }
);
