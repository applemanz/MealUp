import React from 'react';
import { View, Image, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';
import GroupList from '../components/GroupList';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import { userName, userID, userToken } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class FriendsScreen extends React.Component {
  static navigationOptions = {
    title: 'Friends'
  };

  state = {friends: [], groups: []}

  componentDidMount() {
    this.getFriendsAndGroups()
    this.props.navigation.addListener('willFocus', ()=>{
      this.onRefresh();
    });
  }

  getFriendsAndGroups() {
    db.collection("users").doc(userID).collection('Friends').onSnapshot((querySnapshot) => {
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


    db.collection("users").doc(userID).collection('Groups').onSnapshot((querySnapshot) => {
        var groups = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data()
            data['id'] = doc.id
            groups.push(data)
        });
        this.setState({groups:groups});
    });
  }


  onRefresh  = async () => {
    console.log(userToken)
    const response = await fetch(`https://graph.facebook.com/me?access_token=${userToken}&fields=id,name,friends`);
    console.log(response)
    const userData = await response.json();
    console.log(userData)
    const friendsList = userData.friends.data;
    console.log(friendsList);
    for (var friend of friendsList) {
      if (!this.state.friends.find(item => item.id === friend.id)) {
        db.collection('users').doc(userID).collection('Friends').doc(friend.id).update({
          Name: friend.name,
          CanViewMe: true,
          CanViewFriend: true,
        })
        // db.collection('users').doc(friend.id).collection('Friends').doc(userID).get().then((doc)=> {
        //     if (doc.exists) {
        //         var canViewFriend = doc.data().CanViewMe
        //         db.collection('users').doc(userID).collection('Friends').doc(friend.id).set({
        //           CanViewFriend: canViewFriend,
        //         }, { merge: true })
        //     } else {
        //         console.log("No such document!");
        //     }
        // }).catch(function(error) {
        //     console.log("Error getting document:", error);
        // });
      }
    }
    this.getFriendsAndGroups()
  }

  compareFriends = (a,b) => {
    var bCount = 0
    var aCount = 0
    if (b.numOfMeals !== undefined) {
      bCount = b.numOfMeals
    }
    if (a.numOfMeals !== undefined) {
      aCount = a.numOfMeals
    }
    mealCount = bCount - aCount
    if (mealCount != 0) {
      return mealCount
    } else {
      if (a.Name < b.Name) {
        return -1;
      }
      else 
        return 1
    }
  }

  compareGroups = (a,b) => { 
  // code copied from functional compareFriends code...
  // but group names & numOfMeals are not set properly in the first place
    var bCount = 0
    var aCount = 0
    if (b.numOfMeals !== undefined) {
      bCount = b.numOfMeals
    }
    if (a.numOfMeals !== undefined) {
      aCount = a.numOfMeals
    }
    mealCount = bCount - aCount
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
    if (this.state.friends && this.state.groups) {
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
          <View tabLabel='Friends' style={{flex:1}}>
            <ListItem
              title={'Edit Who Can See Your Availability'}
              titleStyle = {{paddingLeft:10}}
              leftIcon = {<Icon
                name={'md-eye'}
                type = 'ionicon'
                color='#000'
              />}
              hideChevron
              onPress = {() => this.props.navigation.navigate('EditFriends')}
            />
            <FriendList style={{flex:1}} data = {obj} navigation = {this.props.navigation} editOn = {false}/>
          </View>
          <GroupList tabLabel='Groups' data = {obj2} navigation = {this.props.navigation} />
        </ScrollableTabView>
      </View>
    );
  }
  else return (
    <View>
        <ActivityIndicator size="large" color="#0000ff" />
    </View>
  )
  }
}
