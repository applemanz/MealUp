import React from 'react';
import { View, Image, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { Avatar, Card, ListItem, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';
import GroupList from '../components/GroupList';
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view';
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
    const response = await fetch(`https://graph.facebook.com/me?access_token=${userToken}&fields=id,name,friends`);
    const userData = await response.json();
    const friendsList = userData.friends.data;
    for (var friend of friendsList) {
      if (!this.state.friends.find(item => item.id === friend.id)) {
        db.collection('users').doc(userID).collection('Friends').doc(friend.id).set({
          Name: friend.name,
          CanViewMe: true,
          CanViewFriend: true,
          numOfMeals: 0,
        })
      }
    }
  }

  compareFriends = (a,b) => {
    var nameA = a.Name.toUpperCase();
    var nameB = b.Name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  compareGroups = (a,b) => {
    if (a.groupName == "") {
      var names = [];
      for (let memberID in a.members) {
        if (memberID != userID)
          if (a.members[memberID].name)
            names.push(a.members[memberID].name.split(" ")[0]);
          else
            names.push(a.members[memberID].split(" ")[0]);
      }
      names.sort()
      displayNameA = ""
      for (let name of names) {
        displayNameA = displayNameA + name + ", "
      }
      displayNameA = displayNameA.slice(0, -2)
    }
    else displayNameA=a.groupName

    if (b.groupName == "") {
      var names = [];
      for (let memberID in b.members) {
        if (memberID != userID)
          names.push(b.members[memberID].split(" ")[0]);
      }
      names.sort()
      displayNameB = ""
      for (let name of names) {
        displayNameB = displayNameB + name + ", "
      }
      displayNameB = displayNameB.slice(0, -2)
    }
    else displayNameB=b.groupName

    if (displayNameA < displayNameB) {
      return -1;
    }
    if (displayNameA > displayNameB) {
      return 1;
    }
    return 0;
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
