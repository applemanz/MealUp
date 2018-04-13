import React from 'react';
import { View, Image, Text, StyleSheet, Button } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, ButtonGroup } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';
import GroupList from '../components/GroupList';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class RequestByFriendScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Request by Friend',
      };
    };

    state = {friends: [], groups: [],};

    componentDidMount() {
      this.getFriendsAndGroups()
    }

    getFriendsAndGroups() {
      db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
          var friends = [];
          querySnapshot.forEach((doc) => {
              friends.push({
                Name: doc.data().Name,
                url:`http://graph.facebook.com/${doc.id}/picture?type=large`,
                id: doc.id,
                CanViewMe: doc.data().CanViewMe,
                CanViewFriend: doc.data().CanViewFriend,
                numOfMeals: doc.data().numOfMeals
              })
          });
          this.setState({friends:friends});
      });

      db.collection("users").doc(userID).collection('Groups').get().then((querySnapshot) => {
          var groups = [];
          querySnapshot.forEach((doc) => {
              let data = doc.data()
              data['id'] = doc.id
              groups.push(data)
          });
          this.setState({groups:groups});
      });
    }

    compareFriends = (a,b) => {
      mealCount = b.numOfMeals - a.numOfMeals
      if (mealCount != 0) return mealCount
      else {
        if (a.Name < b.Name) {
          return -1;
        }
        else
          return 1
      }
    }
    compareGroups = (a,b) => {
      mealCount = b.numOfMeals - a.numOfMeals
      if (mealCount != 0) return mealCount
      else {
        if (a.groupName < b.groupName) {
          return -1;
        }
        else
          return 1
      }
    }

      render() {
        var obj = [...this.state.friends];
        obj.sort(this.compareFriends);
        var obj2 = [...this.state.groups];
        obj2.sort(this.compareGroups);
        return (
          <View style={{flex:1}}>
            <ScrollableTabView
              style={{marginTop: 0, flex:1}}
              renderTabBar={() => <DefaultTabBar />}
              // onChangeTab = {(i, ref) => {this.setState({onFriends: !this.state.onFriends})}}
              tabBarBackgroundColor = {'#f4511e'}
              tabBarActiveTextColor = {'white'}
              tabBarInactiveTextColor = {'black'}
              tabBarUnderlineStyle = {{backgroundColor:'white'}}
            >
              <FriendList tabLabel='Friends' style={{flex:1}} data = {obj} navigation = {this.props.navigation} editOn = {false}/>
              <GroupList tabLabel='Groups' data = {obj2} navigation = {this.props.navigation} />
            </ScrollableTabView>
          </View>
        );
      }
    }
