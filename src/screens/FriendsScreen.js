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
import { userName, userID, userToken } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class FriendsScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Friends',
        headerRight: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Edit' onPress={params.ButtonPressed} />
          </HeaderButtons>
        ),
      };
    };

  state = {friends: [], groups: [], onFriends:true};

  componentWillMount() {
    this.props.navigation.setParams({ ButtonPressed: this.ButtonPressed, buttonText: 'Edit' });
    }

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
        groups = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data()
            data['id'] = doc.id
            groups.push(data)
        });
        this.setState({groups:groups});
    });
  }

  onRefresh  = async () => {
    // const response = await fetch(`https://graph.facebook.com/me?access_token=${userToken}&fields=friends`);
    // const userData = await response.json();
    // const friendsList = userData.friends.data;
    // console.log(friendsList);
    // for (var friend of friendsList) {
    //   if (!this.state.friends.find(item => item.id === friend.id)) {
    //     db.collection('users').doc(friend.id).collection('Friends').doc(userID).get().then((doc)=> {
    //         if (doc.exists) {
    //             var canViewFriend = doc.data().CanViewMe
    //         } else {
    //             // doc.data() will be undefined in this case
    //             console.log("No such document!");
    //         }
    //     }).catch(function(error) {
    //         console.log("Error getting document:", error);
    //     });
    //
    //     db.collection('users').doc(userID).collection('Friends').doc(friend.id).set({
    //       Name: friend.name,
    //       CanViewMe: true,
    //       CanViewFriend: canViewFriend,
    //     })
    //   }
    // }
    this.getFriendsAndGroups()
  }

  ButtonPressed = () => {
    if (this.state.onFriends) {
      this.props.navigation.navigate('EditFriends')
    }
  }

  compare = (b,a) => {
    return a.numOfMeals - b.numOfMeals;
  }
  onChange
  render() {
    var obj = [...this.state.friends];
    obj.sort((a,b) => b.numOfMeals - a.numOfMeals);
    var obj2 = [...this.state.groups];
    obj2.sort((a,b) => b.numOfMeals - a.numOfMeals);
    return (
      <View style={{flex:1}}>
        <ScrollableTabView
          style={{marginTop: 0, flex:1}}
          renderTabBar={() => <DefaultTabBar />}
          onChangeTab = {(i, ref) => {this.setState({onFriends: !this.state.onFriends})}}
          tabBarBackgroundColor = {'#f4511e'}
          tabBarActiveTextColor = {'white'}
          tabBarInactiveTextColor = {'black'}
          tabBarUnderlineStyle = {{backgroundColor:'white'}}
        >
          <FriendList style={{flex:1}} tabLabel='Friends' data = {obj} navigation = {this.props.navigation} editOn = {false}/>
          <GroupList tabLabel='Groups' data = {obj2} navigation = {this.props.navigation} />
        </ScrollableTabView>
      </View>
    );
  }
}
