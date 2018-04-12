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
import EditFriendsScreen from '../screens/EditFriendsScreen';
import AddGroupScreen from '../screens/AddGroupScreen';
import AddMemberScreen from '../screens/AddMemberScreen';

const RequestsStack = StackNavigator({
  Requests: {
    screen: RequestsScreen,
    navigationOptions: {

    },
  },
  RequestByFriend: {
    screen: RequestByFriendScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  RequestByTime: {
    screen: RequestByTimeScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  FriendChosen: {
    screen: FriendChosenScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  TimeChosen: {
    screen: TimeChosenScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  FinalRequest: {
    screen: FinalRequestScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  AddGroup: {
    screen: AddGroupScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  }
},
{
    initialRouteName: 'Requests',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
        shadowColor: 'transparent',
        elevation:0,
        borderBottomWidth: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
});

const FriendsStack = StackNavigator({
  Friends: {
    screen: FriendsScreen,
    navigationOptions: {
      // header: null
    }
  },
  FriendChosen: {
    screen: FriendChosenScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  FinalRequest: {
    screen: FinalRequestScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  EditFriends: {
    screen: EditFriendsScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  AddGroup: {
    screen: AddGroupScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  },
  AddMember: {
    screen: AddMemberScreen,
    navigationOptions: {
      tabBarVisible: false
    }
  }
},
{
    initialRouteName: 'Friends',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
        shadowColor: 'transparent',
        elevation:0,
        borderBottomWidth: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
});

const FreeTimeStack = StackNavigator({
  FreeTime: {
    screen: FreeTimeScreen,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
})

const MealsStack = StackNavigator({
  Meals: {
    screen: HomeScreen,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
})

export default TabNavigator(
  {
    Meals: {
      screen: MealsStack,
      style: {textColor:"#f4511e"}
    },
    Requests: {
      screen: RequestsStack,
    },
    Friends: {
      screen: FriendsStack,
    },
    FreeTime: {
      screen: FreeTimeStack
    }
  },
  {
    initialRouteName: 'Meals',
    tabBarOptions: {
      activeTintColor: '#f4511e',
      labelStyle: {
        fontSize: 14,
      },
      style: {
        // backgroundColor: 'blue',
      },
    },
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
            color={focused ? '#f4511e' : Colors.tabIconDefault}
          />
        );
      },

    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);
